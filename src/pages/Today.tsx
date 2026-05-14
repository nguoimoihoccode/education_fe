import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ArrowRight, BookOpen, Flame, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayLearningHub } from '@/api/education.api';
import { QUERY_KEYS } from '@/config';
import type { TodayLearningHubTask } from '@/types/education.types';
import './Education.css';

const actionIcons: Record<TodayLearningHubTask['type'], ReactNode> = {
  continue_lesson: <BookOpen className="h-5 w-5" />,
  review_vocabulary: <RotateCcw className="h-5 w-5" />,
  fix_mistakes: <Target className="h-5 w-5" />,
  quick_quiz: <Trophy className="h-5 w-5" />,
};

export default function Today() {
  const { data: hub, isError, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.TODAY_HUB,
    queryFn: getTodayLearningHub,
  });
  const minutePercent = hub && hub.dailyGoalMinutes > 0
    ? Math.min(100, Math.round((hub.minutesLearnedToday / hub.dailyGoalMinutes) * 100))
    : 0;
  const taskPercent = hub && hub.totalTasks > 0
    ? Math.min(100, Math.round((hub.completedTasks / hub.totalTasks) * 100))
    : 0;
  const primaryTask = hub?.primaryTask;

  return (
    <div className="education-container education-path-page min-h-screen">
      <div className="dashboard-wrapper relative z-10">
        <header className="edu-path-hero">
          <div>
            <p className="edu-kicker">Personal Learning Hub</p>
            <h1>Kế hoạch học hôm nay</h1>
            <p>
              Tập trung vào những việc có tác động cao nhất: học tiếp bài đang dở,
              ôn flashcards đến hạn và giữ chuỗi học đều mỗi ngày.
            </p>
          </div>
          <Link to="/education" className="edu-primary-action">
            Khám phá khóa học
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        {isLoading ? (
          <div className="edu-loading-path">
            <div className="h-10 w-10 rounded-full border-2 border-emerald-400/30 border-t-emerald-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="edu-empty-path">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-400" />
            <p>Không tải được kế hoạch hôm nay.</p>
            <button type="button" className="edu-primary-action" onClick={() => refetch()}>
              Thử lại
            </button>
          </div>
        ) : hub ? (
          <>
            <main className="edu-learning-grid">
              <section className="edu-next-lesson">
                <div className="edu-card-label">
                  <Sparkles className="h-4 w-4" />
                  Việc nên làm trước
                </div>
                <h2>{primaryTask?.title || 'Hoàn thành quiz ngắn hôm nay'}</h2>
                <p>
                  {primaryTask?.description ||
                    'Bạn đã xong các task chính. Làm thêm một quiz ngắn để củng cố kiến thức.'}
                </p>
                <div className="edu-lesson-meta">
                  <span>
                    <Flame className="h-4 w-4" />
                    {hub.streak.current} ngày streak
                  </span>
                  <span>
                    <Trophy className="h-4 w-4" />
                    {hub.xpToday} XP
                  </span>
                </div>
                {hub.streak.isAtRisk && <p>Hoàn thành một task để giữ streak hôm nay.</p>}
                <Link to={primaryTask?.targetUrl || '/quiz'} className="edu-primary-action">
                  {primaryTask?.ctaLabel || 'Làm quiz'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>

              <aside className="edu-study-today">
                <GoalCard title="Mục tiêu học" value={`${hub.minutesLearnedToday}/${hub.dailyGoalMinutes} phút`} percent={minutePercent} />
                <GoalCard title="Task hôm nay" value={`${hub.completedTasks}/${hub.totalTasks} task`} percent={taskPercent} />
                <Link to="/quiz/stats" className="edu-study-card">
                  <div className="edu-study-icon"><Flame className="h-5 w-5" /></div>
                  <div>
                    <h3>Chuỗi học</h3>
                    <p>Kỷ lục {hub.streak.longest} ngày</p>
                  </div>
                  <span>{hub.streak.current} ngày</span>
                </Link>
              </aside>
            </main>

            <section className="edu-course-library">
              <div className="edu-library-header">
                <div>
                  <h2>Danh sách hành động</h2>
                  <p>Làm theo thứ tự ưu tiên để không phải tự quyết định học gì.</p>
                </div>
              </div>
              <div className="education-learning-path">
                {hub.tasks.map((task) => (
                  <Link key={task.id} to={task.targetUrl} className={`path-node ${task.completed ? '' : 'active'}`}>
                    <div className="path-node-index">{actionIcons[task.type]}</div>
                    <div>
                      <p className="path-node-step">Ưu tiên {task.priority} • {task.estimatedMinutes} phút</p>
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                    </div>
                    <span>{task.completed ? 'Đã xong' : task.ctaLabel}</span>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="edu-empty-path">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-400" />
            <p>Chưa tạo được kế hoạch học.</p>
            <span>Hãy đăng ký một khóa học hoặc thử lại sau.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function GoalCard({ title, value, percent }: { title: string; value: string; percent: number }) {
  return (
    <div className="edu-study-card">
      <div className="edu-study-icon"><Target className="h-5 w-5" /></div>
      <div>
        <h3>{title}</h3>
        <p>{percent}% hoàn thành</p>
      </div>
      <span>{value}</span>
    </div>
  );
}
