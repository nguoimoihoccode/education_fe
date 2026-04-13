import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Target, List, BarChart2, Play } from 'lucide-react';
import { getQuizById } from '@/api/quiz.api';
import '../Education.css';

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const quizId = id!;

  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId),
    enabled: !!quizId,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
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

  if (error || !quiz) {
    return (
      <div className="education-container">
        <div className="ambient-background">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="noise-overlay"></div>
        </div>
        <div className="detail-wrapper py-20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Quiz Not Found</h2>
          <p className="text-slate-400 mb-6">The quiz you're looking for doesn't exist or has been removed.</p>
          <Link to="/quiz" className="px-6 py-3 rounded-full bg-accent-600 text-white font-medium hover:bg-accent-700 transition-all">
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="education-container">
      

      <div className="detail-wrapper">
        <Link to="/quiz" className="btn-back mb-6 inline-flex items-center">
          ← Back to Quizzes
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {quiz.topic && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-500/10 text-accent-400 border border-accent-500/20">
                    {quiz.topic}
                  </span>
                )}
                {quiz.difficulty && quiz.difficulty !== 'MIXED' && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty.toLowerCase()}
                  </span>
                )}
                {quiz.questionType && quiz.questionType !== 'MIXED' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    {quiz.questionType.replace('_', ' ')}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{quiz.name}</h1>
              {quiz.description && (
                <p className="text-slate-300 text-sm md:text-base max-w-3xl">{quiz.description}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                to={`/quiz/${quiz.id}/session`}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-accent-900/30"
              >
                <Play className="w-5 h-5" />
                Start Quiz
              </Link>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quiz Info Card */}
          <div className="glass-card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-accent-400" />
              Quiz Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Questions</dt>
                <dd className="text-white font-medium">{quiz.questionCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Time Limit</dt>
                <dd className="text-white font-medium">{formatTime(quiz.timeLimit)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Passing Score</dt>
                <dd className="text-white font-medium">{quiz.passingScore}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Retries</dt>
                <dd className="text-white font-medium">
                  {quiz.allowRetry ? `${quiz.maxRetries} allowed` : 'Not allowed'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Shuffle</dt>
                <dd className="text-white font-medium">
                  {quiz.shuffleQuestions ? 'Questions' : 'None'}
                  {quiz.shuffleAnswers && ' + Answers'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Show Answers</dt>
                <dd className="text-white font-medium">{quiz.showCorrectAnswer ? 'After submit' : 'Hidden'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Visibility</dt>
                <dd className="text-white font-medium">{quiz.isPublic ? 'Public' : 'Private'}</dd>
              </div>
            </dl>
          </div>

          {/* Questions Preview */}
          <div className="md:col-span-2 glass-card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-accent-400" />
              Questions ({quiz.questions?.length || 0})
            </h3>

            {quiz.questions && quiz.questions.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {quiz.questions.map((question, idx) => (
                  <div key={question.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-bold text-accent-400">Question {idx + 1}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="capitalize">{question.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{question.points} point{question.points > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <p className="text-white mb-3 leading-relaxed">{question.question}</p>
                    {question.options && question.options.length > 0 && (
                      <ul className="space-y-2 mb-3">
                        {question.options.map((option, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="w-5 h-5 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                              {String.fromCharCode(65 + i)}
                            </span>
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-xs text-emerald-400 font-semibold mb-1">Correct Answer:</p>
                      <p className="text-sm text-emerald-300">{question.correctAnswer}</p>
                      {question.explanation && (
                        <p className="text-xs text-slate-400 mt-2 italic">{question.explanation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500">
                <p>This quiz has no questions yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'EASY':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'HARD':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}
