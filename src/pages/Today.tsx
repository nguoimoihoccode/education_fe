import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ArrowRight, BookOpen, Flame, GraduationCap, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLearningPlan } from '@/api/education.api';
import { QUERY_KEYS } from '@/config';
import type { LearningPlanAction } from '@/types/education.types';
import './Education.css';

const actionIcons: Record<LearningPlanAction['type'], ReactNode> = {
  lesson: <BookOpen className="h-5 w-5" />,
  flashcard_review: <RotateCcw className="h-5 w-5" />,
  quiz_retry: <Target className="h-5 w-5" />,
};

export default function Today() {
  const { data: plan, isLoading } = useQuery({
    queryKey: QUERY_KEYS.LEARNING_PLAN,
    queryFn: getLearningPlan,
  });
  const minutePercent = plan
    ? Math.min(100, Math.round((plan.dailyGoal.completedMinutes / plan.dailyGoal.targetMinutes) * 100))
    : 0;
  const reviewPercent = plan
    ? Math.min(100, Math.round((plan.dailyGoal.completedReviews / plan.dailyGoal.targetReviews) * 100))
    : 0;

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
        ) : plan ? (
          <>
            <main className="edu-learning-grid">
              <section className="edu-next-lesson">
                <div className="edu-card-label">
                  <Sparkles className="h-4 w-4" />
                  Việc nên làm trước
                </div>
                <h2>{plan.recommendedActions[0]?.title || 'Bắt đầu một phiên học ngắn'}</h2>
                <p>
                  {plan.recommendedActions[0]?.reason ||
                    'Chọn một bài học hoặc quiz ngắn để duy trì nhịp học.'}
                </p>
                <div className="edu-lesson-meta">
                  <span>
                    <Flame className="h-4 w-4" />
                    {plan.streak.current} ngày streak
                  </span>
                  <span>
                    <Trophy className="h-4 w-4" />
                    Level {plan.streak.level} • {plan.streak.xp} XP
                  </span>
                </div>
                <Link to={plan.recommendedActions[0]?.route || '/education'} className="edu-primary-action">
                  Bắt đầu ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>

              <aside className="edu-study-today">
                <GoalCard title="Mục tiêu học" value={`${plan.dailyGoal.completedMinutes}/${plan.dailyGoal.targetMinutes} phút`} percent={minutePercent} />
                <GoalCard title="Ôn tập" value={`${plan.dueReviews.count} đến hạn`} percent={reviewPercent} />
                <Link to="/quiz/stats" className="edu-study-card">
                  <div className="edu-study-icon"><Flame className="h-5 w-5" /></div>
                  <div>
                    <h3>Chuỗi học</h3>
                    <p>Kỷ lục {plan.streak.longest} ngày</p>
                  </div>
                  <span>{plan.streak.current} ngày</span>
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
                {plan.recommendedActions.map((action) => (
                  <Link key={`${action.type}-${action.route}`} to={action.route} className="path-node active">
                    <div className="path-node-index">{actionIcons[action.type]}</div>
                    <div>
                      <p className="path-node-step">Ưu tiên {action.priority}</p>
                      <h3>{action.title}</h3>
                      <p>{action.reason}</p>
                    </div>
                    <span>Làm ngay</span>
                  </Link>
                ))}
              </div>
            </section>

            {plan.nextLesson && (
              <section className="edu-course-library">
                <div className="edu-library-header">
                  <div>
                    <h2>Bài học tiếp theo</h2>
                    <p>{plan.nextLesson.courseTitle}</p>
                  </div>
                </div>
                <Link to={plan.nextLesson.route} className="edu-course-card">
                  <div className="edu-course-flag"><GraduationCap className="h-5 w-5" /></div>
                  <div>
                    <p>{plan.nextLesson.estimatedMinutes} phút</p>
                    <h3>{plan.nextLesson.title}</h3>
                    <span>Tiếp tục khóa học đang học</span>
                  </div>
                </Link>
              </section>
            )}

            {plan.weakQuizzes.length > 0 && (
              <section className="edu-course-library">
                <div className="edu-library-header">
                  <div>
                    <h2>Điểm yếu cần luyện</h2>
                    <p>Những quiz điểm thấp được đưa vào kế hoạch để bạn ôn đúng chỗ.</p>
                  </div>
                </div>
                <div className="edu-course-grid">
                  {plan.weakQuizzes.map((quiz) => (
                    <Link key={quiz.quizId} to={quiz.route} className="edu-course-card">
                      <div className="edu-course-flag"><Target className="h-5 w-5" /></div>
                      <div>
                        <p>{quiz.topic}</p>
                        <h3>{quiz.title}</h3>
                        <span>{quiz.recommendation}</span>
                      </div>
                      <strong className="text-amber-300">{quiz.score}%</strong>
                    </Link>
                  ))}
                </div>
              </section>
            )}
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
