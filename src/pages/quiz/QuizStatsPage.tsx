import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuizStats, getQuizHistory } from '@/api/quiz.api';
import { QuizStats as QuizStatsComponent } from '@/components/quiz';
import { Pagination } from '@/components/ui';
import { TrendingUp } from 'lucide-react';
import '../Education.css';

export default function QuizStatsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['quizStats'],
    queryFn: getQuizStats,
  });

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['quizHistory', currentPage, itemsPerPage],
    queryFn: () => getQuizHistory({ page: currentPage, limit: itemsPerPage }),
  });

  const history = historyData?.items || [];
  const totalPages = historyData?.totalPages || 1;

  return (
    <div className="education-container">
      

      <div className="dashboard-wrapper">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Quiz Statistics</h1>
          <p className="text-slate-400">Track your performance and progress</p>
        </header>

        {isLoadingStats ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : stats && (
          <>
            <div className="mb-10">
              <QuizStatsComponent stats={stats} />
            </div>

            {/* Score Trend Chart */}
            <div className="glass-card mb-8">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-400" />
                Score History
              </h3>

              {history.length > 0 ? (
                <div className="h-64 overflow-x-auto">
                  <div className="h-full flex items-end space-x-1 min-w-max" style={{ width: 'max-content' }}>
                    {history.map((item, idx) => {
                      const score = Math.round(item.score);
                      return (
                        <div key={item.id} className="flex flex-col items-center flex-1 min-w-[40px] group">
                          <div
                            className="w-full bg-gradient-to-t from-accent-600 to-fuchsia-500 rounded-t-sm transition-all duration-700 hover:from-fuchsia-400 hover:to-accent-300"
                            style={{
                              height: '0%',
                              animation: `growBar 1s ease-out forwards ${idx * 0.05}s`,
                              '--target-height': `${score}%`,
                            } as React.CSSProperties}
                          ></div>
                          <span className="text-[10px] text-slate-500 mt-1 transform hover:-translate-y-1 transition-transform">
                            {idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>Earlier</span>
                    <span>Recent</span>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500">
                  <p>No attempt history yet.</p>
                </div>
              )}
            </div>

            {/* History Table */}
            <div className="glass-card">
              <h2 className="text-xl font-bold text-white mb-6">Recent Attempts</h2>

              {isLoadingHistory ? (
                <div className="py-10 text-center">
                  <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  <p>No quiz attempts yet.</p>
                  <a href="/quiz" className="text-accent-400 hover:underline mt-2 inline-block">
                    Start your first quiz
                  </a>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 border-b border-white/10">
                          <th className="pb-3 font-medium">Quiz</th>
                          <th className="pb-3 font-medium">Topic</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Score</th>
                          <th className="pb-3 font-medium">Result</th>
                          <th className="pb-3 font-medium">Time Spent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {history.map((item) => (
                          <tr key={item.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4">
                              <a href={`/quiz/${item.quizId}`} className="text-white font-medium hover:text-accent-400">
                                {item.quizName}
                              </a>
                            </td>
                            <td className="py-4 text-slate-300">{item.topic}</td>
                            <td className="py-4 text-slate-400">
                              {new Date(item.startTime).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                              <span className={`font-bold ${item.score >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {Math.round(item.score)}%
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${item.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {item.passed ? 'Passed' : 'Failed'}
                              </span>
                            </td>
                            <td className="py-4 text-slate-400">
                              {formatTime(item.timeSpent)}
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
          </>
        )}
      </div>

      <style>{`
        @keyframes growBar {
          from { height: 0; opacity: 0; }
          to { height: var(--target-height); opacity: 1; }
        }
      `}</style>
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
