import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Send,
} from 'lucide-react';
import {
  getQuizById,
  getQuizSessionQuestions,
  getQuizSession,
  startQuizSession,
  submitQuizAnswer,
  completeQuizSession,
} from '@/api/quiz.api';
import { getQuizBatchView } from './batchView';
import { getQuizSessionView } from './sessionView';
import { parseQuizPlayMode } from './quizMode';
import type { QuizSession, SubmitAnswerResult } from '@/types/quiz.types';
import { QUERY_KEYS } from '@/config/query';
import toast from 'react-hot-toast';
import '../Education.css';

function getQuestionTypeLabel(type?: string) {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'Trắc nghiệm';
    case 'TRUE_FALSE':
      return 'Đúng/Sai';
    case 'FILL_BLANK':
      return 'Điền vào chỗ trống';
    case 'MIXED':
      return 'Tổng hợp';
    default:
      return 'Câu hỏi';
  }
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function QuizSessionPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const playMode = parseQuizPlayMode(searchParams.get('mode'));
  const isExamMode = playMode === 'exam';
  const difficulty = searchParams.get('difficulty');
  const count = searchParams.get('count');

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Exam (batch) state
  const [batchIndex, setBatchIndex] = useState(0);
  const [maxReachedBatchIndex, setMaxReachedBatchIndex] = useState(0);
  const [questionIndexInBatch, setQuestionIndexInBatch] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpentByQuestion, setTimeSpentByQuestion] = useState<Record<string, number>>({});
  const [submittedQuestionIds, setSubmittedQuestionIds] = useState<Set<string>>(() => new Set());
  const [isFinishing, setIsFinishing] = useState(false);
  const finishStartedRef = useRef(false);

  // Practice state
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeSpentOnQuestion, setTimeSpentOnQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<SubmitAnswerResult | null>(null);
  const [localAnsweredCount, setLocalAnsweredCount] = useState(0);
  const [localCorrectCount, setLocalCorrectCount] = useState(0);

  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId!),
    enabled: !!quizId,
  });

  const { data: session } = useQuery({
    queryKey: ['quizSession', sessionId],
    queryFn: () => (sessionId ? getQuizSession(sessionId) : Promise.reject('No session')),
    enabled: !!sessionId,
    refetchInterval: false,
  });

  const { data: sessionQuestions = [] } = useQuery({
    queryKey: ['quizSessionQuestions', quizId, sessionId],
    queryFn: () => getQuizSessionQuestions(quizId!, sessionId || undefined),
    enabled: !!quizId && !!sessionId,
  });

  const startMutation = useMutation({
    mutationFn: () =>
      startQuizSession(quizId!, {
        difficulty:
          difficulty === 'EASY' || difficulty === 'MEDIUM' || difficulty === 'HARD'
            ? difficulty
            : undefined,
        questionCount:
          count === '10' || count === '20' || count === '30'
            ? (Number(count) as 10 | 20 | 30)
            : undefined,
      }),
    onSuccess: (data) => {
      setSessionId(data.id);
    },
    onError: () => {
      toast.error('Không thể bắt đầu phiên quiz');
      navigate('/quiz');
    },
  });

  const questionIds = useMemo(
    () => sessionQuestions.map((question) => question.id),
    [sessionQuestions],
  );

  const batchView = useMemo(
    () =>
      getQuizBatchView({
        totalQuestions: sessionQuestions.length,
        batchIndex,
        questionIndexInBatch,
        maxReachedBatchIndex,
        answers,
        questionIds,
      }),
    [
      sessionQuestions.length,
      batchIndex,
      questionIndexInBatch,
      maxReachedBatchIndex,
      answers,
      questionIds,
    ],
  );

  const practiceView = useMemo(
    () =>
      getQuizSessionView(
        {
          questionCount: sessionQuestions.length || quiz?.questionCount,
          questions: sessionQuestions.length ? sessionQuestions : quiz?.questions,
        },
        { currentQuestionIndex: localAnsweredCount },
        Boolean(feedback),
      ),
    [sessionQuestions, quiz, localAnsweredCount, feedback],
  );

  const examQuestion = sessionQuestions[batchView.globalQuestionIndex] ?? null;
  const practiceQuestion = practiceView.currentQuestion;
  const currentQuestion = isExamMode ? examQuestion : practiceQuestion;
  const examSelectedAnswer = examQuestion ? (answers[examQuestion.id] ?? '') : '';
  const displaySelectedAnswer = isExamMode ? examSelectedAnswer : selectedAnswer;

  const startCurrentSession = useEffectEvent(() => {
    if (quizId && !sessionId) {
      startMutation.mutate();
    }
  });

  const navigateToResult = useCallback(
    (id: string) => {
      const params = new URLSearchParams();
      params.set('mode', playMode);
      if (difficulty) params.set('difficulty', difficulty);
      if (count) params.set('count', count);
      const q = params.toString();
      navigate(`/quiz/session/${id}/result${q ? `?${q}` : ''}`);
    },
    [count, difficulty, navigate, playMode],
  );

  const completeAndGo = useCallback(
    async (id: string) => {
      await completeQuizSession(id);
      queryClient.invalidateQueries({ queryKey: ['quizSession', id] });
      queryClient.invalidateQueries({ queryKey: ['quizStats'] });
      queryClient.invalidateQueries({ queryKey: ['quizHistory'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODAY_PLAN });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODAY_HUB });
      navigateToResult(id);
    },
    [navigateToResult, queryClient],
  );

  const finishExam = useCallback(
    async (reason: 'submit' | 'timeout') => {
      if (!sessionId || finishStartedRef.current) return;
      finishStartedRef.current = true;
      setIsFinishing(true);

      try {
        const pending = sessionQuestions.filter(
          (question) =>
            !submittedQuestionIds.has(question.id) &&
            typeof answers[question.id] === 'string' &&
            answers[question.id].trim().length > 0,
        );

        const nextSubmitted = new Set(submittedQuestionIds);

        for (const question of pending) {
          await submitQuizAnswer(sessionId, {
            questionId: question.id,
            answer: answers[question.id],
            timeSpent: timeSpentByQuestion[question.id] ?? 0,
          });
          nextSubmitted.add(question.id);
          setSubmittedQuestionIds(new Set(nextSubmitted));
        }

        if (reason === 'timeout') {
          toast('Hết giờ — đã nộp các câu đã chọn');
        }

        await completeAndGo(sessionId);
      } catch {
        finishStartedRef.current = false;
        setIsFinishing(false);
        toast.error('Không thể nộp bài. Thử lại.');
      }
    },
    [
      answers,
      completeAndGo,
      sessionId,
      sessionQuestions,
      submittedQuestionIds,
      timeSpentByQuestion,
    ],
  );

  const finishPracticeTimeout = useCallback(async () => {
    if (!sessionId || finishStartedRef.current) return;
    finishStartedRef.current = true;
    setIsFinishing(true);
    try {
      toast('Hết giờ — đã kết thúc phiên luyện tập');
      await completeAndGo(sessionId);
    } catch {
      finishStartedRef.current = false;
      setIsFinishing(false);
      toast.error('Không thể kết thúc phiên');
    }
  }, [completeAndGo, sessionId]);

  useEffect(() => {
    startCurrentSession();
  }, [quizId, sessionId]);

  useEffect(() => {
    if (!session || !quiz || isFinishing) return;

    const startTime = new Date(session.startTime).getTime();
    const totalTime = quiz.timeLimit;
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = totalTime - elapsed;
      setTimeRemaining(remaining > 0 ? remaining : 0);
      if (remaining <= 0) {
        if (isExamMode) {
          void finishExam('timeout');
        } else {
          void finishPracticeTimeout();
        }
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [session, quiz, isFinishing, isExamMode, finishExam, finishPracticeTimeout]);

  // Exam: track time on current editable question
  useEffect(() => {
    if (!isExamMode || !examQuestion || isFinishing || !batchView.isEditable) return;

    const timer = setInterval(() => {
      setTimeSpentByQuestion((prev) => ({
        ...prev,
        [examQuestion.id]: (prev[examQuestion.id] ?? 0) + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamMode, examQuestion, isFinishing, batchView.isEditable, batchView.globalQuestionIndex]);

  // Practice: track time on current question when not showing feedback
  useEffect(() => {
    if (isExamMode || !session || isSubmitting || feedback || isFinishing) return;

    const timer = setInterval(() => {
      setTimeSpentOnQuestion((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamMode, session, isSubmitting, feedback, isFinishing, practiceView.displayQuestionIndex]);

  const handleExamAnswerSelect = (answer: string) => {
    if (!examQuestion || !batchView.isEditable || isFinishing) return;
    setAnswers((prev) => ({ ...prev, [examQuestion.id]: answer }));
  };

  const handlePracticeAnswerSelect = (answer: string) => {
    if (isSubmitting || feedback || isFinishing) return;
    setSelectedAnswer(answer);
  };

  const handlePracticeSubmit = async () => {
    if (
      !sessionId ||
      !practiceQuestion ||
      !selectedAnswer.trim() ||
      isSubmitting ||
      feedback ||
      isFinishing
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitQuizAnswer(sessionId, {
        questionId: practiceQuestion.id,
        answer: selectedAnswer,
        timeSpent: timeSpentOnQuestion,
      });

      setFeedback(result);
      setLocalAnsweredCount((prev) => prev + 1);
      if (result.isCorrect) {
        setLocalCorrectCount((prev) => prev + 1);
      }

      queryClient.setQueryData<QuizSession>(['quizSession', sessionId], (current) => {
        if (!current) return current;
        return {
          ...current,
          // Provider already increments index; keep client in sync without double-add on next read
          currentQuestionIndex: Math.max(current.currentQuestionIndex, localAnsweredCount + 1),
          totalAnswers: Math.max(current.totalAnswers, localAnsweredCount + 1),
          correctAnswers: result.isCorrect
            ? Math.max(current.correctAnswers, localCorrectCount + 1)
            : Math.max(current.correctAnswers, localCorrectCount),
        };
      });
    } catch {
      toast.error('Không thể nộp câu trả lời');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePracticeContinue = async () => {
    if (!sessionId || !feedback) return;

    const total = sessionQuestions.length || quiz?.questionCount || 0;
    if (localAnsweredCount >= total) {
      setIsFinishing(true);
      try {
        await completeAndGo(sessionId);
      } catch {
        setIsFinishing(false);
        toast.error('Không thể hoàn thành quiz');
      }
      return;
    }

    setFeedback(null);
    setSelectedAnswer('');
    setTimeSpentOnQuestion(0);
  };

  const handleGoPrevQuestion = () => {
    if (!batchView.canGoPrevQuestion) return;
    setQuestionIndexInBatch((prev) => prev - 1);
  };

  const handleGoNextQuestion = () => {
    if (!batchView.canGoNextQuestion) return;
    setQuestionIndexInBatch((prev) => prev + 1);
  };

  const handleGoPrevBatch = () => {
    if (!batchView.canGoPrevBatch) return;
    setBatchIndex((prev) => prev - 1);
    setQuestionIndexInBatch(0);
  };

  const handleGoNextBatch = () => {
    if (!batchView.canGoNextBatch) return;
    const next = batchIndex + 1;
    setBatchIndex(next);
    setMaxReachedBatchIndex((prev) => Math.max(prev, next));
    setQuestionIndexInBatch(0);
  };

  const handleSelectBatchQuestion = (indexInBatch: number) => {
    if (indexInBatch < 0 || indexInBatch >= batchView.batchLength) return;
    setQuestionIndexInBatch(indexInBatch);
  };

  const isStarting = startMutation.isPending || (isLoadingQuiz && !quiz);
  const isOfflineMode = import.meta.env.VITE_QUIZ_OFFLINE_MODE === 'true';
  const optionsDisabled = isExamMode
    ? !batchView.isEditable || isFinishing
    : Boolean(feedback) || isSubmitting || isFinishing;

  const progressPercent = isExamMode
    ? batchView.progressPercent
    : practiceView.progress;

  const headerQuestionLabel = isExamMode
    ? `Câu ${batchView.globalQuestionIndex + 1} / ${batchView.totalQuestions}`
    : `Câu ${practiceView.displayQuestionIndex + 1} / ${practiceView.totalQuestions}`;

  if (isLoadingQuiz || isStarting || (quiz && !session && !startMutation.isError)) {
    return (
      <div className="education-container">
        <div className="ambient-background">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="noise-overlay"></div>
        </div>
        <div className="detail-wrapper flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 text-sm font-medium">Đang chuẩn bị phiên quiz...</p>
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
          <h2 className="text-2xl font-bold text-white mb-4">Lỗi phiên làm bài</h2>
          <p className="text-slate-300 mb-6">Không thể tải phiên quiz.</p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-3 rounded-full bg-accent-600 text-white font-medium hover:bg-accent-700 transition-all"
          >
            Quay lại danh sách quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="education-container education-path-page" style={{ color: 'var(--app-text)' }}>
      <div className="detail-wrapper">
        {isOfflineMode && (
          <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-200">
            Chế độ offline — dữ liệu quiz lưu trên máy, không đồng bộ server.
          </div>
        )}

        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white truncate">{quiz.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isExamMode
                      ? 'bg-rose-500/15 text-rose-200 border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
                  }`}
                >
                  {isExamMode ? 'Kiểm tra' : 'Học'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span>{headerQuestionLabel}</span>
                {isExamMode && (
                  <span>
                    Lô {batchView.totalBatches === 0 ? 0 : batchView.batchIndex + 1} /{' '}
                    {batchView.totalBatches}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isExamMode ? (
                <>
                  <div className="glass-card px-4 py-2 text-center">
                    <div className="text-lg font-bold text-accent-400">
                      {batchView.answeredCount}/{batchView.totalQuestions}
                    </div>
                    <div className="text-xs text-slate-300">Đã chọn</div>
                  </div>
                  {!batchView.isEditable && (
                    <div className="glass-card px-4 py-2 text-center">
                      <div className="text-sm font-bold text-amber-300">Chỉ xem</div>
                      <div className="text-xs text-slate-300">Lô đã qua</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="glass-card px-4 py-2 text-center">
                    <div className="text-lg font-bold text-accent-400">{localCorrectCount}</div>
                    <div className="text-xs text-slate-300">Đúng</div>
                  </div>
                  <div className="glass-card px-4 py-2 text-center">
                    <div className="text-lg font-bold text-white">
                      {localAnsweredCount > 0
                        ? Math.round((localCorrectCount / localAnsweredCount) * 100)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-slate-300">Điểm</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 h-2 bg-slate-700/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-600 to-fuchsia-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </header>

        {isExamMode && batchView.batchLength > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {Array.from({ length: batchView.batchLength }, (_, index) => {
              const questionId = batchView.batchQuestionIds[index];
              const answered = Boolean(answers[questionId]?.trim());
              const active = index === batchView.questionIndexInBatch;
              return (
                <button
                  key={questionId}
                  type="button"
                  onClick={() => handleSelectBatchQuestion(index)}
                  disabled={isFinishing}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    active
                      ? 'bg-accent-600 border-accent-500 text-white'
                      : answered
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Câu {batchView.batchStart + index + 1}
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion && (
          <div className="glass-card mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-accent-400">
                  {getQuestionTypeLabel(currentQuestion.type)}
                </span>
                <span className="text-sm text-slate-300">{currentQuestion.points} điểm</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">{currentQuestion.question}</h2>
            </div>

            {currentQuestion.options && currentQuestion.options.length > 0 ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = displaySelectedAnswer === option;
                  const showFeedback = !isExamMode && Boolean(feedback);
                  const isCorrectOption = showFeedback && option === feedback?.correctAnswer;
                  const isWrongSelected =
                    showFeedback && isSelected && !feedback?.isCorrect;

                  return (
                    <button
                      key={`${currentQuestion.id}-${idx}`}
                      type="button"
                      onClick={() =>
                        isExamMode
                          ? handleExamAnswerSelect(option)
                          : handlePracticeAnswerSelect(option)
                      }
                      disabled={optionsDisabled}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isCorrectOption
                          ? 'bg-emerald-500/20 border-2 border-emerald-500 text-white'
                          : isWrongSelected
                            ? 'bg-rose-500/20 border-2 border-rose-500 text-white'
                            : isSelected
                              ? 'bg-accent-600/20 border-2 border-accent-500 text-white'
                              : 'bg-white/5 border border-white/10 text-slate-100 hover:bg-white/10 hover:border-accent-500/30'
                      } ${optionsDisabled && !showFeedback ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            isCorrectOption
                              ? 'bg-emerald-600 text-white'
                              : isWrongSelected
                                ? 'bg-rose-600 text-white'
                                : isSelected
                                  ? 'bg-accent-600 text-white'
                                  : 'bg-white/10 text-slate-200'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 pt-1">{option}</span>
                        {isCorrectOption && (
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        )}
                        {isWrongSelected && (
                          <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                        )}
                        {!showFeedback && isSelected && (
                          <CheckCircle className="w-5 h-5 text-accent-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={displaySelectedAnswer}
                  onChange={(e) =>
                    isExamMode
                      ? handleExamAnswerSelect(e.target.value)
                      : handlePracticeAnswerSelect(e.target.value)
                  }
                  disabled={optionsDisabled}
                  placeholder="Nhập câu trả lời"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-accent-500 disabled:opacity-70"
                />
              </div>
            )}

            {!isExamMode && feedback && (
              <div
                className={`mt-6 rounded-2xl border px-4 py-3 ${
                  feedback.isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-100'
                }`}
              >
                <p className="font-bold mb-1">
                  {feedback.isCorrect ? 'Chính xác!' : 'Chưa đúng'}
                </p>
                {!feedback.isCorrect && (
                  <p className="text-sm mb-1">
                    Đáp án đúng: <span className="font-semibold">{feedback.correctAnswer}</span>
                  </p>
                )}
                {feedback.explanation && (
                  <p className="text-sm opacity-90">{feedback.explanation}</p>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {isExamMode ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleGoPrevBatch}
                      disabled={!batchView.canGoPrevBatch || isFinishing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-medium hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Lô trước
                    </button>
                    <button
                      type="button"
                      onClick={handleGoPrevQuestion}
                      disabled={!batchView.canGoPrevQuestion || isFinishing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-medium hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Câu trước
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={handleGoNextQuestion}
                      disabled={!batchView.canGoNextQuestion || isFinishing}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-medium hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Câu sau
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {!batchView.isLastBatch ? (
                      <button
                        type="button"
                        onClick={handleGoNextBatch}
                        disabled={!batchView.canGoNextBatch || isFinishing}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Lô tiếp
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void finishExam('submit')}
                        disabled={!batchView.canSubmitQuiz || isFinishing}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isFinishing ? 'Đang nộp bài...' : 'Nộp bài'}
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex w-full justify-end">
                  {feedback ? (
                    <button
                      type="button"
                      onClick={() => void handlePracticeContinue()}
                      disabled={isFinishing}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {practiceView.shouldFinishAfterFeedback ||
                      localAnsweredCount >= practiceView.totalQuestions
                        ? isFinishing
                          ? 'Đang kết thúc...'
                          : 'Xem kết quả'
                        : 'Câu tiếp'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handlePracticeSubmit()}
                      disabled={!selectedAnswer.trim() || isSubmitting || isFinishing}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Đang chấm...' : 'Kiểm tra'}
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="glass-card p-4">
          <div className="flex items-start gap-2 text-sm text-slate-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              {isExamMode
                ? 'Chế độ Kiểm tra: trong lô hiện tại có thể đổi đáp án; lô đã qua chỉ xem; điểm chấm khi nộp bài.'
                : 'Chế độ Học: chọn đáp án rồi bấm Kiểm tra để xem đúng/sai và giải thích ngay.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
