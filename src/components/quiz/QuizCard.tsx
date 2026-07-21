import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Target,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Zap,
} from 'lucide-react';
import type { Quiz } from '@/types/quiz.types';
import clsx from 'clsx';

interface QuizCardProps {
  quiz: Quiz;
  onEdit?: (quiz: Quiz) => void;
  onDelete?: (quiz: Quiz) => void;
  onStartQuiz?: (quiz: Quiz) => void;
}

export function QuizCard({ quiz, onEdit, onDelete, onStartQuiz }: QuizCardProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(quiz);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(quiz);
  };

  const isOfflineHskQuiz =
    quiz.id === 'offline-quiz-hsk1' || quiz.id === 'offline-quiz-hsk2';
  const hasQuestions =
    isOfflineHskQuiz ||
    (quiz.questions?.length ?? 0) > 0 ||
    quiz.questionCount > 0;

  const handleStartQuiz = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartQuiz?.(quiz);
    // HSK offline needs difficulty/count config on detail first
    if (isOfflineHskQuiz) {
      navigate(`/quiz/${quiz.id}`);
      return;
    }
    if (!hasQuestions) {
      navigate(`/quiz/${quiz.id}`);
      return;
    }
    // Always go detail so user can pick Học / Kiểm tra
    navigate(`/quiz/${quiz.id}`);
  };

  const handleViewDetails = () => {
    navigate(`/quiz/${quiz.id}`);
  };

  const formatTimeLimit = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m`;
    return `${secs}s`;
  };

  const getDifficultyConfig = (difficulty?: string) => {
    switch (difficulty) {
      case 'EASY':
        return { label: 'Dễ', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'from-emerald-500/20 to-teal-500/20' };
      case 'MEDIUM':
        return { label: 'Trung bình', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'from-amber-500/20 to-orange-500/20' };
      case 'HARD':
        return { label: 'Khó', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'from-rose-500/20 to-red-500/20' };
      default:
        return { label: 'Tổng hợp', bg: 'bg-accent-500/10', text: 'text-accent-400', border: 'border-accent-500/20', glow: 'from-accent-500/20 to-fuchsia-500/20' };
    }
  };

  const getQuestionTypeLabel = (type?: string) => {
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
        return 'Chưa rõ';
    }
  };

  const diffConfig = getDifficultyConfig(quiz.difficulty ?? undefined);

  return (
    <div
      className="group relative bg-slate-800/80 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 hover:border-accent-500/30 cursor-pointer"
      onClick={handleViewDetails}
    >
      {/* Header */}
      <div className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black font-headline text-white group-hover:text-accent-300 line-clamp-2 leading-tight">
              {quiz.name}
            </h3>
            {quiz.description && (
              <p className="text-sm text-slate-300 mt-2 line-clamp-2 leading-relaxed">{quiz.description}</p>
            )}
          </div>

          {/* Menu Button */}
          <div className="relative ml-3">
            <button
              onClick={handleMenuClick}
              className="p-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white border border-transparent hover:border-white/10"
              aria-label="Thêm tùy chọn"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-slate-800 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 py-2 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3"
                >
                  <Edit className="w-4 h-4 text-accent-400" />
                  Sửa quiz
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2.5 text-left text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-3"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa quiz
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Topic & Difficulty */}
        <div className="flex flex-wrap gap-2 mb-5">
          {quiz.topic && (
            <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-accent-500/10 text-accent-400 border border-accent-500/20">
              {quiz.topic}
            </span>
          )}
          {quiz.difficulty && quiz.difficulty !== 'MIXED' && (
            <span
              className={clsx(
                'px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase border',
                diffConfig.bg, diffConfig.text, diffConfig.border,
              )}
            >
              {diffConfig.label}
            </span>
          )}
          {quiz.questionType && quiz.questionType !== 'MIXED' && (
            <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-white/5 text-slate-300 border border-white/10">
              {getQuestionTypeLabel(quiz.questionType)}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <List className="w-3.5 h-3.5 text-accent-400" />
            </div>
            <div className="text-xl font-black font-mono text-white">{quiz.questionCount}</div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Câu hỏi</div>
          </div>

          <div className="text-center p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black font-mono text-white">{formatTimeLimit(quiz.timeLimit)}</div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Thời gian</div>
          </div>

          <div className="text-center p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="flex items-center justify-center gap-1 mb-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black font-mono text-white">{quiz.passingScore}%</div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Đạt</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/5 bg-black/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={clsx(
              'px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border',
              quiz.isPublic
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-white/5 text-slate-300 border-white/10'
            )}>
              {quiz.isPublic ? 'Công khai' : 'Riêng tư'}
            </span>
            {quiz.shuffleQuestions && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Trộn câu hỏi
              </span>
            )}
            {quiz.allowRetry && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                ×{quiz.maxRetries}
              </span>
            )}
          </div>

          <button
            onClick={handleStartQuiz}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-600 to-fuchsia-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <Zap className="w-4 h-4" />
            {isOfflineHskQuiz ? 'Cấu hình' : hasQuestions ? 'Bắt đầu' : 'Chi tiết'}
          </button>
        </div>
      </div>
    </div>
  );
}
