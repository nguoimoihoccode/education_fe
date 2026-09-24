import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Award, Home, RotateCw } from 'lucide-react';
import {
  startReviewSession,
  reviewFlashcard,
  completeReviewSession,
} from '@/api/flashcard.api';
import { QUERY_KEYS } from '@/config/query';
import { FlashcardReview } from '@/components/flashcard';
import type { ReviewResult, ReviewSession } from '@/types/flashcard.types';
import toast from 'react-hot-toast';

export default function FlashcardReviewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get('deckId');

  const [session, setSession] = useState<ReviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [reviewResults, setReviewResults] = useState<ReviewResult[]>([]);
  const [skippedCards, setSkippedCards] = useState(0);

  // Start review session
  const { data: sessionData, isLoading: isLoadingSession } = useQuery({
    queryKey: ['reviewSession', deckId],
    queryFn: () => startReviewSession({ deckId: deckId || undefined, limit: 20, type: 'DAILY' }),
    enabled: !session,
  });

  const activeSession = session ?? sessionData?.session ?? null;
  const flashcards = sessionData?.flashcards ?? [];

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: ({ flashcardId, quality }: { flashcardId: string; quality: number }) =>
      reviewFlashcard(flashcardId, { flashcardId, quality }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcardStats'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODAY_PLAN });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODAY_HUB });
    },
    onError: () => toast.error('Failed to review flashcard'),
  });

  // Complete session mutation
  const completeMutation = useMutation({
    mutationFn: (sessionId: string) =>
      completeReviewSession({ sessionId, results: reviewResults, skippedCards }),
    onSuccess: (completedSession) => {
      queryClient.invalidateQueries({ queryKey: ['flashcardStats'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODAY_PLAN });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODAY_HUB });
      setSession(completedSession);
      setIsComplete(true);
      toast.success(`Review complete! +${completedSession.xpEarned} XP`);
    },
    onError: () => toast.error('Failed to complete review session'),
  });

  const handleReview = (flashcardId: string, quality: number) => {
    if (reviewMutation.isPending) return;
    reviewMutation.mutate({ flashcardId, quality });
    setReviewResults((previous) => [
      ...previous,
      {
        flashcardId,
        quality,
        correct: quality >= 3,
        isCorrect: quality >= 3,
        timeSpent: 0,
      },
    ]);
    setCurrentIndex(currentIndex + 1);
  };

  const handleComplete = () => {
    if (activeSession) {
      completeMutation.mutate(activeSession.id);
    }
  };

  const handleSkip = () => {
    if (activeSession) {
      // Update session stats
      setSkippedCards((previous) => previous + 1);
      setSession({
        ...activeSession,
        skippedCards: activeSession.skippedCards + 1,
      });
    }
    setCurrentIndex(currentIndex + 1);
  };

  const handleGoHome = () => {
    navigate('/flashcards');
  };

  const handleRestart = () => {
    setSession(null);
    setCurrentIndex(0);
    setIsComplete(false);
    setReviewResults([]);
    setSkippedCards(0);
    queryClient.invalidateQueries({ queryKey: ['reviewSession'] });
  };

  // Loading state
  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // No cards to review
  if (!isLoadingSession && (!activeSession || flashcards.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
        <div className="text-center max-w-md bg-slate-800/80 p-10 rounded-3xl border border-white/10">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black font-headline text-white mb-2">All Caught Up!</h2>
          <p className="text-slate-400 mb-8 text-lg">
            You have no cards due for review right now. Come back later!
          </p>
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all shadow-lg"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Complete state
  if (isComplete && activeSession) {
    const accuracy = activeSession.totalCards > 0
      ? Math.round((activeSession.correctCards / activeSession.totalCards) * 100)
      : 0;

    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
        <div className="text-center max-w-lg w-full bg-slate-800/80 p-10 rounded-3xl border border-white/10">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-accent-500 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-white/20"></div>
            <Award className="w-14 h-14 text-white" />
          </div>

          <h2 className="text-4xl font-black font-headline text-white mb-2">Review Complete!</h2>
          <p className="text-slate-400 mb-8 text-lg">Great job on completing your review session</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div className="text-3xl font-black font-mono text-emerald-400">{activeSession.correctCards}</div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mt-1">Correct</div>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div className="text-3xl font-black font-mono text-rose-400">{activeSession.wrongCards}</div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mt-1">Wrong</div>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div className="text-3xl font-black font-mono text-amber-400">{activeSession.xpEarned}</div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mt-1">XP Earned</div>
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-6 border border-white/5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Accuracy</span>
              <span className="text-3xl font-black font-mono text-white">{accuracy}%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-accent-500 transition-all duration-1000 ease-out"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
            >
              <RotateCw className="w-5 h-5" />
              Review Again
            </button>
            <button
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent-600 text-on-accent font-bold hover:bg-accent-500 transition-colors"
            >
              <Home className="w-5 h-5 fill-current" />
              Go to Decks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review session
  return (
    <FlashcardReview
      flashcards={flashcards}
      session={activeSession!}
      onReview={handleReview}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
