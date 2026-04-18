import { useEffect, useEffectEvent, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, ArrowRight, AlertCircle } from 'lucide-react';
import {
  getQuizById,
  getQuizSession,
  startQuizSession,
  submitQuizAnswer,
  completeQuizSession,
} from '@/api/quiz.api';
import { getQuizSessionView } from './sessionView';
import type { QuizSession } from '@/types/quiz.types';
import toast from 'react-hot-toast';
import '../Education.css';

export default function QuizSessionPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timeSpentOnQuestion, setTimeSpentOnQuestion] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string; explanation?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch quiz details
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId!),
    enabled: !!quizId,
  });

  // Session query (only when sessionId exists)
  const { data: session } = useQuery({
    queryKey: ['quizSession', sessionId],
    queryFn: () => (sessionId ? getQuizSession(sessionId) : Promise.reject('No session')),
    enabled: !!sessionId,
    refetchInterval: false,
  });

  // Start session mutation
  const startMutation = useMutation({
    mutationFn: () => startQuizSession(quizId!),
    onSuccess: (data) => {
      setSessionId(data.id);
    },
    onError: () => {
      toast.error('Failed to start quiz session');
      navigate('/quiz');
    },
  });

  // Complete session mutation
  const completeMutation = useMutation({
    mutationFn: (sessionId: string) => completeQuizSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizSession', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['quizStats'] });
      queryClient.invalidateQueries({ queryKey: ['quizHistory'] });
      navigate(`/quiz/session/${sessionId}/result`);
    },
    onError: () => {
      toast.error('Failed to complete quiz');
    },
  });

  const {
    totalQuestions,
    displayQuestionIndex,
    currentQuestion,
    shouldFinishAfterFeedback,
    progress,
  } = getQuizSessionView(quiz ?? {}, session ?? {}, !!feedback);

  const startCurrentSession = useEffectEvent(() => {
    if (quizId && !sessionId) {
      startMutation.mutate();
    }
  });

  const completeCurrentSession = useEffectEvent(() => {
    if (session && !completeMutation.isPending) {
      completeMutation.mutate(session.id);
    }
  });

  // Submit answer mutation
  const submitMutation = useMutation({
    mutationFn: (payload: { sessionId: string; questionId: string; answer: string; timeSpent: number }) =>
      submitQuizAnswer(payload.sessionId, payload),
    onSuccess: async (result) => {
      if (sessionId) {
        queryClient.setQueryData<QuizSession>(['quizSession', sessionId], (current) => {
          if (!current) return current;

          return {
            ...current,
            currentQuestionIndex: current.currentQuestionIndex + 1,
            totalAnswers: current.totalAnswers + 1,
            correctAnswers: result.isCorrect
              ? current.correctAnswers + 1
              : current.correctAnswers,
          };
        });
      }

      setFeedback({
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
      });
      setIsSubmitting(false);
      await queryClient.invalidateQueries({ queryKey: ['quizSession', sessionId] });
    },
    onError: () => {
      toast.error('Failed to submit answer');
      setIsSubmitting(false);
    },
  });

  // Start the quiz on mount
  useEffect(() => {
    startCurrentSession();
  }, [quizId, sessionId]);

  // Timer countdown for entire quiz
  useEffect(() => {
    if (session && quiz) {
      // Calculate total elapsed time from session.startTime and quiz.timeLimit
      const startTime = new Date(session.startTime).getTime();
      const totalTime = quiz.timeLimit; // in seconds
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = totalTime - elapsed;
        setTimeRemaining(remaining > 0 ? remaining : 0);
        if (remaining <= 0) {
          completeCurrentSession();
        }
      };
      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [session, quiz]);

  // Timer for current question time spent
  useEffect(() => {
    if (session && !feedback && !isSubmitting) {
      const timer = setInterval(() => {
        setTimeSpentOnQuestion((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session, feedback, isSubmitting]);

  // Auto-advance when feedback is shown
  useEffect(() => {
    if (feedback && shouldFinishAfterFeedback) {
      const delay = setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer('');
        setTimeSpentOnQuestion(0);
        completeCurrentSession();
      }, 2000); // 2 second delay to show feedback
      return () => clearTimeout(delay);
    }
  }, [feedback, shouldFinishAfterFeedback]);

  useEffect(() => {
    if (feedback && !shouldFinishAfterFeedback) {
      const delay = setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer('');
        setTimeSpentOnQuestion(0);
      }, 2000);

      return () => clearTimeout(delay);
    }
  }, [feedback, shouldFinishAfterFeedback]);

  const handleAnswerSelect = (answer: string) => {
    if (!feedback && !isSubmitting) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !session || !quiz || isSubmitting) return;
    setIsSubmitting(true);
    if (!currentQuestion) {
      setIsSubmitting(false);
      return;
    }
    submitMutation.mutate({
      sessionId: session.id,
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      timeSpent: timeSpentOnQuestion,
    });
    // setIsSubmitting will be reset in onError or after feedback clears
  };

  const handleNext = () => {
    if (feedback) {
      setFeedback(null);
      setSelectedAnswer('');
      setTimeSpentOnQuestion(0);
      if (shouldFinishAfterFeedback) {
        completeCurrentSession();
      }
    }
  };

  if (isLoadingQuiz) {
    return (
      <div className="education-container">
        <div className="ambient-background">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="noise-overlay"></div>
        </div>
        <div className="detail-wrapper flex items-center justify-center py-20">
          <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!quiz || !session) {
    return (
      <div className="education-container">
        <div className="ambient-background">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="noise-overlay"></div>
        </div>
        <div className="detail-wrapper py-20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Session Error</h2>
          <p className="text-slate-400 mb-6">Unable to load quiz session.</p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-3 rounded-full bg-accent-600 text-white font-medium hover:bg-accent-700 transition-all"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="education-container">
      

      <div className="detail-wrapper">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 truncate">{quiz.name}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Question {displayQuestionIndex + 1} of {totalQuestions}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="glass-card px-4 py-2 text-center">
                <div className="text-lg font-bold text-accent-400">{session.correctAnswers}</div>
                <div className="text-xs text-slate-400">Correct</div>
              </div>
              <div className="glass-card px-4 py-2 text-center">
                <div className="text-lg font-bold text-white">{session.score}%</div>
                <div className="text-xs text-slate-400">Score</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-slate-700/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-600 to-fuchsia-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </header>

        {/* Question Area */}
        {currentQuestion && (
          <div className="glass-card mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-accent-400">
                  {currentQuestion.type.replace('_', ' ')}
                </span>
                <span className="text-sm text-slate-400">{currentQuestion.points} point{currentQuestion.points > 1 ? 's' : ''}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">{currentQuestion.question}</h2>
            </div>

            {/* Options */}
            {currentQuestion.options && currentQuestion.options.length > 0 ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = feedback && option === currentQuestion.correctAnswer;
                  const isWrong = feedback && isSelected && option !== currentQuestion.correctAnswer;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={!!feedback || isSubmitting}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-accent-600/20 border-2 border-accent-500 text-white'
                          : feedback
                          ? isCorrect
                            ? 'bg-emerald-500/10 border-2 border-emerald-500 text-emerald-200'
                            : isWrong
                            ? 'bg-red-500/10 border-2 border-red-500 text-red-200'
                            : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-accent-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isSelected
                            ? 'bg-accent-600 text-white'
                            : feedback && isCorrect
                            ? 'bg-emerald-500 text-white'
                            : feedback && isWrong
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 pt-1">{option}</span>
                        {isSelected && <CheckCircle className="w-5 h-5 text-accent-400 flex-shrink-0" />}
                        {feedback && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                        {feedback && isWrong && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={!!feedback || isSubmitting}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-all"
                />
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`mt-6 p-4 rounded-xl border ${
                feedback.isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  {feedback.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-bold mb-1 ${feedback.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                    </h4>
                    <p className="text-sm text-slate-300 mb-2">
                      {feedback.isCorrect
                        ? `+${currentQuestion.points} point${currentQuestion.points > 1 ? 's' : ''}`
                        : `The correct answer is: <span class="font-bold text-white">${feedback.correctAnswer}</span>`
                      }
                    </p>
                    {feedback.explanation && (
                      <p className="text-sm text-slate-400 italic">{feedback.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex justify-end gap-3">
              {!feedback && !isSubmitting && (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer.trim() || isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {feedback && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all"
                >
                  {shouldFinishAfterFeedback ? 'Finish' : 'Next Question'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <AlertCircle className="w-4 h-4" />
            <span>Your answers are automatically recorded. You cannot go back to previous questions.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to format time
function formatTime(seconds: number): string {
  if (seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
