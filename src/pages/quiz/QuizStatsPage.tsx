import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { getQuizStats, getQuizHistory } from '@/api/quiz.api';
import { QuizStats as QuizStatsComponent } from '@/components/quiz';
import { Pagination } from '@/components/ui';
import { RefreshCw, TrendingUp } from 'lucide-react';
import '../Education.css';

export default function QuizStatsPage() {
  const location = useLocation();
  const isHistoryFocus = location.pathname === '/quiz/history';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isStatsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['quizStats'],
    queryFn: getQuizStats,
    enabled: !isHistoryFocus,
  });

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['quizHistory', currentPage, itemsPerPage],
    queryFn: () => getQuizHistory({ page: currentPage, limit: itemsPerPage }),
  });

  const history = historyData?.items || [];
  const totalPages = historyData?.totalPages || 1;

  return (
    <div className="education-container education-path-page" style={{ color: 'var(--app-text)' }}>
      <div className="dashboard-wrapper">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {isHistoryFocus ? 'Lịch sử làm bài' : 'Thống kê quiz'}
            </h1>
            <p className="text-slate-300">
              {isHistoryFocus
                ? 'Xem lại các phiên luyện tập và mở kết quả chi tiết'
                : 'Theo dõi kết quả và tiến độ của bạn'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/quiz/stats"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                !isHistoryFocus
                  ? 'bg-accent-600 text-white'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              Thống kê
            </Link>
            <Link
              to="/quiz/history"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isHistoryFocus
                  ? 'bg-accent-600 text-white'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              Lịch sử
            </Link>
          </div>
        </header>

        {!isHistoryFocus && (
          <>
            {isLoadingStats ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 border-2 border-accent-500/40 rounded-full mx-auto"></div>
              </div>
            ) : stats ? (
              <>
                <div className="mb-10">
                  <QuizStatsComponent stats={stats} />
                </div>

                <div className="glass-card mb-8">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-400" />
                    Lịch sử điểm số
                  </h3>

                  {history.length > 0 ? (
                    <div className="h-64 overflow-x-auto">
                      <div className="h-full flex items-end space-x-1 min-w-max" style={{ width: 'max-content' }}>
                        {history.map((item, idx) => {
                          const score = Math.round(item.score);
                          return (
                            <Link
                              key={item.id}
                              to={`/quiz/session/${item.id}/result`}
                              className="flex flex-col items-center flex-1 min-w-[40px] group"
                              title={`${item.quizName}: ${score}%`}
                            >
                              <div
                                className="w-full bg-gradient-to-t from-accent-600 to-fuchsia-500 rounded-t-sm group-hover:opacity-90"
                                style={{ height: `${score}%` } as React.CSSProperties}
                              ></div>
                              <span className="text-[10px] text-slate-300 mt-1">{idx + 1}</span>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-slate-300 mt-2">
                        <span>Cũ hơn</span>
                        <span>Gần đây</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-300">
                      <p>Chưa có lịch sử làm bài.</p>
                      <Link to="/quiz" className="text-accent-400 hover:underline mt-2 inline-block">
                        Bắt đầu quiz
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="glass-card py-12 text-center mb-8">
                <p className="text-white font-bold mb-2">
                  {isStatsError ? 'Không tải được thống kê quiz' : 'Chưa có dữ liệu thống kê'}
                </p>
                <p className="text-slate-400 text-sm mb-6">
                  Thử tải lại hoặc bắt đầu một quiz để có dữ liệu.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => refetchStats()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Thử lại
                  </button>
                  <Link
                    to="/quiz"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-600 text-white text-sm font-bold hover:bg-accent-500 transition-all"
                  >
                    Bắt đầu quiz
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {isHistoryFocus ? 'Tất cả lần làm bài' : 'Lần làm bài gần đây'}
            </h2>
            {!isHistoryFocus && (
              <Link to="/quiz/history" className="text-sm font-bold text-accent-400 hover:text-accent-300">
                Xem đầy đủ →
              </Link>
            )}
          </div>

          {isLoadingHistory ? (
            <div className="py-10 text-center">
              <div className="w-10 h-10 border-2 border-accent-500/40 rounded-full mx-auto"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="py-10 text-center text-slate-300">
              <p>Bạn chưa làm quiz nào.</p>
              <Link to="/quiz" className="text-accent-400 hover:underline mt-2 inline-block">
                Bắt đầu quiz đầu tiên
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-300 border-b border-white/10">
                      <th className="pb-3 font-medium">Quiz</th>
                      <th className="pb-3 font-medium">Chủ đề</th>
                      <th className="pb-3 font-medium">Ngày</th>
                      <th className="pb-3 font-medium">Điểm</th>
                      <th className="pb-3 font-medium">Kết quả</th>
                      <th className="pb-3 font-medium">Thời gian</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5">
                        <td className="py-4">
                          <Link to={`/quiz/${item.quizId}`} className="text-white font-medium hover:text-accent-400">
                            {item.quizName}
                          </Link>
                        </td>
                        <td className="py-4 text-slate-300">{item.topic}</td>
                        <td className="py-4 text-slate-300">
                          {new Date(item.startTime).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <span className={`font-bold ${item.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {Math.round(item.score)}%
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${item.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {item.passed ? 'Đạt' : 'Chưa đạt'}
                          </span>
                        </td>
                        <td className="py-4 text-slate-300">
                          {formatTime(item.timeSpent)}
                        </td>
                        <td className="py-4 text-right">
                          <Link
                            to={`/quiz/session/${item.id}/result`}
                            className="text-xs font-bold text-accent-400 hover:text-accent-300"
                          >
                            Xem kết quả
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
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
