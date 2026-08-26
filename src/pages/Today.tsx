import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ArrowRight, BookOpen, Flame, RotateCcw, Sparkles, Target, Trophy, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTodayLearningHub } from '@/api/education.api';
import { QUERY_KEYS } from '@/config';
import { isOnboarded } from '@/utils/onboarding';
import type { TodayLearningHubTask } from '@/types/education.types';
import './Education.css';

const actionIcons: Record<TodayLearningHubTask['type'], ReactNode> = {
  continue_lesson: <BookOpen className="h-5 w-5" />,
  review_vocabulary: <RotateCcw className="h-5 w-5" />,
  fix_mistakes: <Target className="h-5 w-5" />,
  quick_quiz: <Trophy className="h-5 w-5" />,
};

export default function Today() {
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem('edupro-onboarding-dismissed') === '1';
    } catch {
      // ignore
    }
    return !isOnboarded() && !dismissed;
  });
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
        {showOnboardingBanner && (
          <section
            className="today-onboarding-banner"
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              padding: '12px 16px', borderRadius: '16px', marginBottom: '20px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(16,185,129,0.12))',
              border: '1px solid var(--app-border, rgba(255,255,255,0.12))',
              color: 'var(--app-text)',
            }}
          >
            <Sparkles className="h-5 w-5" style={{ color: 'var(--app-primary, #8b5cf6)' }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <strong className="block">Cá nhân hoá lộ trình của bạn</strong>
              <span className="text-sm" style={{ opacity: 0.8 }}>
                Chọn ngôn ngữ, trình độ và mục tiêu trong 30 giây để nhận kế hoạch phù hợp.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link to="/onboarding" className="btn-primary">
                Cá nhân hoá
              </Link>
              <button
                type="button"
                aria-label="Đóng"
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'var(--app-text-subtle)' }}
                onClick={() => {
                  localStorage.setItem('edupro-onboarding-dismissed', '1');
                  setShowOnboardingBanner(false);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}
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
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link to="/education" className="edu-primary-action">
                Đăng ký khóa học
              </Link>
              <button type="button" className="edu-primary-action" onClick={() => refetch()}>
                Thử lại
              </button>
            </div>
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
