import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy, XCircle,RotateCw, Home, BarChart2 } from 'lucide-react';
import { getQuizSession, getWrongAnswers, getQuizById } from '@/api/quiz.api';
import '../Education.css';

export default function QuizResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const sessionId_ = sessionId!;

  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ['quizSession', sessionId_],
    queryFn: () => getQuizSession(sessionId_),
    enabled: !!sessionId_,
  });

  const { data: quiz } = useQuery({
    queryKey: ['quiz', session?.quizId],
    queryFn: () => getQuizById(session!.quizId),
    enabled: !!session?.quizId,
  });

  const { data: wrongAnswers } = useQuery({
    queryKey: ['wrongAnswers', sessionId_],
    queryFn: () => getWrongAnswers(sessionId_),
    enabled: !!sessionId_ && session?.status === 'COMPLETED',
  });

  if (isLoadingSession) {
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

  if (!session || !quiz) {
    return (
      <div className="education-container">
        <div className="ambient-background">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="noise-overlay"></div>
        </div>
        <div className="detail-wrapper py-20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Result Not Found</h2>
          <p className="text-slate-400 mb-6">Unable to load quiz results.</p>
          <Link to="/quiz" className="px-6 py-3 rounded-full bg-accent-600 text-white font-medium hover:bg-accent-700 transition-all">
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const isPassed = session.passed;
  const totalQuestions = quiz.questionCount;
  const correctCount = session.correctAnswers;
  const incorrectCount = totalQuestions - correctCount;
  const passThreshold = quiz.passingScore;

  return (
    <div className="education-container">
      

      <div className="detail-wrapper">
        <Link to="/quiz" className="btn-back mb-6 inline-flex items-center">
          ← Back to Quizzes
        </Link>

        {/* Hero Card */}
        <div className={`glass-card p-8 text-center mb-8 ${isPassed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amberber-500/5 border-amber-500/20'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPassed ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
            {isPassed ? (
              <Trophy className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-amber-400" />
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
          </h1>
          <p className="text-slate-300 mb-6">
            {isPassed
              ? `You passed the quiz with a score of ${Math.round(session.score)}%`
              : `You scored ${Math.round(session.score)}%. You need ${passThreshold}% to pass.`}
          </p>

          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-3xl font-bold text-white mb-1">{correctCount}</div>
              <div className="text-sm text-emerald-400">Correct</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-3xl font-bold text-white mb-1">{incorrectCount}</div>
              <div className="text-sm text-red-400">Incorrect</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-3xl font-bold text-white mb-1">{session.timeSpent ? formatTime(session.timeSpent) : '--'}</div>
              <div className="text-sm text-slate-400">Time Spent</div>
            </div>
          </div>

          {(quiz as any).certificateUrl && isPassed && (
            <div className="mt-6">
              <a
                href={(quiz as any).certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:scale-105 transition-transform"
              >
                <Trophy className="w-5 h-5" />
                Download Certificate
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {quiz.allowRetry && !isPassed && ((session as any).userRetries || 0) < quiz.maxRetries && (
            <Link
              to={`/quiz/${quiz.id}/session`}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent-600 text-white font-medium hover:bg-accent-700 transition-all"
            >
              <RotateCw className="w-5 h-5" />
              Try Again
            </Link>
          )}
          <Link
            to={`/quiz/${quiz.id}`}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
          >
            <BarChart2 className="w-5 h-5" />
            Review Quiz
          </Link>
          <Link
            to="/quiz"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all"
          >
            <Home className="w-5 h-5" />
            All Quizzes
          </Link>
        </div>

        {/* Wrong Answers */}
        {wrongAnswers && wrongAnswers.length > 0 && (
          <div className="glass-card mb-8">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Questions You Missed ({wrongAnswers.length})
            </h3>
            <div className="space-y-4">
              {wrongAnswers.map((item, idx) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-white mb-3 font-medium">{item.question}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                      <p className="text-xs text-red-400 mb-1">Your Answer</p>
                      <p className="text-red-200">{item.userAnswer}</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                      <p className="text-xs text-emerald-400 mb-1">Correct Answer</p>
                      <p className="text-emerald-200">{item.correctAnswer}</p>
                    </div>
                  </div>
                  {item.explanation && (
                    <p className="mt-3 text-sm text-slate-400 italic">{item.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Info */}
        <div className="glass-card">
          <h3 className="font-bold text-white mb-4">Session Details</h3>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-slate-400">Quiz</dt>
              <dd className="text-white font-medium truncate">{quiz.name}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Status</dt>
              <dd className="text-white font-medium capitalize">{session.status.toLowerCase()}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Started</dt>
              <dd className="text-white font-medium">{new Date(session.startTime).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Completed</dt>
              <dd className="text-white font-medium">
                {session.endTime ? new Date(session.endTime).toLocaleString() : '-'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
