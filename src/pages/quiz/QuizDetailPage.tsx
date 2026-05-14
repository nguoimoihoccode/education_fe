import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { List, BarChart2, Play } from 'lucide-react';
import { getQuizById } from '@/api/quiz.api';
import type { QuizQuestion } from '@/types/quiz.types';
import {
  HSK1_EASY_QUESTIONS,
  HSK1_MEDIUM_QUESTIONS,
  HSK1_HARD_QUESTIONS,
  HSK2_EASY_QUESTIONS,
  HSK2_MEDIUM_QUESTIONS,
  HSK2_HARD_QUESTIONS,
} from '@/mocks/quizOffline';
import { getQuizDetailPreviewQuestions } from './quizDetailPreview';
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

  const isOfflineHskQuiz =
    quiz?.id === 'offline-quiz-hsk1' || quiz?.id === 'offline-quiz-hsk2';
  const [selectedDifficulty, setSelectedDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<10 | 20 | 30>(20);
  const [previewSeed] = useState(() => Math.floor(Math.random() * 1000));
  const hskPreviewPool = quiz?.id === 'offline-quiz-hsk2'
    ? selectedDifficulty === 'EASY'
      ? HSK2_EASY_QUESTIONS
      : selectedDifficulty === 'MEDIUM'
        ? HSK2_MEDIUM_QUESTIONS
        : HSK2_HARD_QUESTIONS
    :
    selectedDifficulty === 'EASY'
      ? HSK1_EASY_QUESTIONS
      : selectedDifficulty === 'MEDIUM'
        ? HSK1_MEDIUM_QUESTIONS
        : HSK1_HARD_QUESTIONS;
  const previewQuestions = getQuizDetailPreviewQuestions(
    isOfflineHskQuiz ? hskPreviewPool : (quiz?.questions ?? []),
    isOfflineHskQuiz,
    previewSeed,
    isOfflineHskQuiz ? selectedQuestionCount : 20,
  );

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
          <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy bài quiz</h2>
          <p className="text-slate-300 mb-6">Bài quiz bạn đang tìm không tồn tại hoặc đã bị gỡ bỏ.</p>
          <Link to="/quiz" className="px-6 py-3 rounded-full bg-accent-600 text-white font-medium hover:bg-accent-700 transition-all">
            Quay lại danh sách quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="education-container">
      

      <div className="detail-wrapper">
        <Link to="/quiz" className="btn-back mb-6 inline-flex items-center">
          ← Quay lại danh sách quiz
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
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/30">
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
                to={isOfflineHskQuiz
                  ? `/quiz/${quiz.id}/session?difficulty=${selectedDifficulty}&count=${selectedQuestionCount}`
                  : `/quiz/${quiz.id}/session`}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-accent-900/30"
              >
                <Play className="w-5 h-5" />
                Bắt đầu làm bài
              </Link>
            </div>
          </div>
        </header>

        {isOfflineHskQuiz && (
          <div className="glass-card mb-8">
            <h3 className="font-bold text-white mb-4">Cấu hình luyện HSK</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-300 mb-3">Độ khó</p>
                <div className="flex gap-2 flex-wrap">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map((difficulty) => (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                        selectedDifficulty === difficulty
                          ? 'bg-accent-600 text-white border-accent-500'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      {difficulty === 'EASY' ? 'Dễ' : difficulty === 'MEDIUM' ? 'Vừa' : 'Khó'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-300 mb-3">Số câu hỏi</p>
                <div className="flex gap-2 flex-wrap">
                  {([10, 20, 30] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSelectedQuestionCount(count)}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                        selectedQuestionCount === count
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      {count} câu
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quiz Info Card */}
          <div className="glass-card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-accent-400" />
              Chi tiết bài quiz
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-300">Questions</dt>
                <dd className="text-white font-medium">{isOfflineHskQuiz ? selectedQuestionCount : quiz.questionCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-300">Thời gian làm bài</dt>
                <dd className="text-white font-medium">{formatTime(quiz.timeLimit)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-300">Điểm đạt</dt>
                <dd className="text-white font-medium">{quiz.passingScore}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-300">Số lần làm lại</dt>
                <dd className="text-white font-medium">
                  {quiz.allowRetry ? `${quiz.maxRetries} lần` : 'Không cho phép'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-300">Trộn câu hỏi</dt>
                <dd className="text-white font-medium">
                  {quiz.shuffleQuestions ? 'Câu hỏi' : 'Không'}
                  {quiz.shuffleAnswers && ' + Đáp án'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-300">Hiển thị đáp án</dt>
                <dd className="text-white font-medium">{quiz.showCorrectAnswer ? 'Sau khi nộp bài' : 'Ẩn'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-300">Hiển thị</dt>
                <dd className="text-white font-medium">{quiz.isPublic ? 'Công khai' : 'Riêng tư'}</dd>
              </div>
            </dl>
          </div>

          {/* Questions Preview */}
          <div className="md:col-span-2 glass-card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-accent-400" />
              Câu hỏi mẫu ({previewQuestions.length})
            </h3>

            {isOfflineHskQuiz && (
               <p className="text-sm text-slate-300 mb-4">
                Xem trước {selectedQuestionCount} câu - Mức {selectedDifficulty === 'EASY' ? 'Dễ' : selectedDifficulty === 'MEDIUM' ? 'Vừa' : 'Khó'}
              </p>
            )}

            {previewQuestions.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {previewQuestions.map((question: QuizQuestion, idx) => (
                      <div key={question.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-bold text-accent-400">Câu hỏi {idx + 1}</span>
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="capitalize">{question.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{question.points} điểm</span>
                          </div>
                        </div>
                    <p className="text-white mb-3 leading-relaxed">{question.question}</p>
                    {question.options && question.options.length > 0 && (
                      <ul className="space-y-2 mb-3">
                        {question.options.map((option, i) => (
                           <li key={i} className="flex items-start gap-2 text-sm text-slate-100">
                            <span className="w-5 h-5 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                              {String.fromCharCode(65 + i)}
                            </span>
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-300">
                <p>Bài quiz này chưa có câu hỏi.</p>
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
      return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
  }
}
