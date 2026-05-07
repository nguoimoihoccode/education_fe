import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, Loader2, RefreshCcw } from 'lucide-react';
import { FlashcardStats } from '@/components/flashcard';
import { getFlashcardStats } from '@/api/flashcard.api';
import './Education.css';

export default function FlashcardStatsPage() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['flashcardStats'],
    queryFn: getFlashcardStats,
  });

  return (
    <div className="education-container relative min-h-screen">
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px]" />
      </div>

      <div className="dashboard-wrapper relative z-10">
        <div className="mb-8">
          <Link
            to="/flashcards"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Flashcards
          </Link>

          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-headline text-white mb-2 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-accent-400" />
                Thống kê Flashcards
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                Theo dõi tiến độ ghi nhớ, lịch ôn tập và hiệu suất học từ vựng.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/flashcards/review"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent-600 text-white font-bold hover:bg-accent-700 transition-colors"
              >
                <RefreshCcw className="w-5 h-5" />
                Ôn tập ngay
              </Link>
              <Link
                to="/flashcards/document-import"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Nhập tài liệu
              </Link>
            </div>
          </header>
        </div>

        {isLoading && (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-accent-400" />
          </div>
        )}

        {isError && (
          <div className="bg-slate-800/80 backdrop-blur-md border border-red-500/20 rounded-3xl p-8 text-center">
            <p className="text-red-300 font-semibold mb-4">
              Không tải được thống kê flashcard.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 text-red-200 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <RefreshCcw className="w-5 h-5" />
              Thử lại
            </button>
          </div>
        )}

        {stats && <FlashcardStats stats={stats} />}
      </div>
    </div>
  );
}
