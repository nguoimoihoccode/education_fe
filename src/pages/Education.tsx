import { useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { getCourses, getLanguages, getTodayPlan } from '@/api/education.api';
import { QUERY_KEYS } from '@/config/query';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui';
import type { Course, TodayPlanTask } from '@/types/education.types';
import './Education.css';

export default function Education() {
  const { isAuthenticated } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageByLanguage, setPageByLanguage] = useState<Record<string, number>>({ all: 1 });
  const itemsPerPage = 12;
  const languageKey = selectedLanguage ?? 'all';
  const currentPage = pageByLanguage[languageKey] ?? 1;

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses', selectedLanguage, currentPage, itemsPerPage],
    queryFn: () =>
      getCourses({
        languageId: selectedLanguage || undefined,
        page: currentPage,
        limit: itemsPerPage,
      }),
  });
  const {
    data: todayPlan,
    isLoading: isLoadingTodayPlan,
    isError: isTodayPlanError,
    refetch: refetchTodayPlan,
  } = useQuery({
    queryKey: QUERY_KEYS.TODAY_PLAN,
    queryFn: getTodayPlan,
    enabled: isAuthenticated,
  });

  const courses: Course[] = coursesData?.items || [];
  const totalPages = coursesData?.totalPages || 1;
  const filteredCourses = courses.filter((course) =>
    `${course.title} ${course.language?.name ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const pathCourses = filteredCourses.slice(0, 6);
  const primaryTodayTask = todayPlan?.tasks.find((task) => !task.completed) ?? todayPlan?.tasks[0];

  const handlePageChange = (page: number) => {
    setPageByLanguage((previous) => ({ ...previous, [languageKey]: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="education-container education-path-page min-h-screen">
      <div className="dashboard-wrapper relative z-10">
        <header className="edu-path-hero">
          <div>
            <p className="edu-kicker">EduPro Learning Path</p>
            <h1>Hôm nay học gì?</h1>
            <p>
              Một lộ trình rõ ràng cho buổi học hôm nay: học bài tiếp theo,
              ôn flashcards đến hạn và luyện đúng điểm yếu.
            </p>
          </div>

          <div className="edu-search">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm khóa học, ngôn ngữ..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Tìm khóa học hoặc ngôn ngữ"
            />
          </div>
        </header>

        <main className="today-plan-shell">
          {!isAuthenticated ? (
            <section className="today-plan-empty">
              <Sparkles className="h-10 w-10 text-emerald-600" />
              <h2>Đăng nhập để nhận kế hoạch học mỗi ngày</h2>
              <p>EduPro sẽ gom bài học, flashcards và quiz thành một checklist ngắn gọn cho hôm nay.</p>
              <Link to="/login" className="edu-primary-action">Đăng nhập</Link>
            </section>
          ) : isLoadingTodayPlan ? (
            <section className="today-plan-hero today-plan-loading" role="status" aria-live="polite">
              <div className="h-12 w-12 rounded-full border-2 border-emerald-400/30 border-t-emerald-500 animate-spin" />
              <p>Đang chuẩn bị kế hoạch hôm nay...</p>
            </section>
          ) : isTodayPlanError ? (
            <section className="today-plan-error">
              <h2>Không tải được kế hoạch hôm nay</h2>
              <p>Thử lại để EduPro tạo checklist học tập mới nhất cho bạn.</p>
              <button type="button" onClick={() => refetchTodayPlan()}>
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </button>
            </section>
          ) : todayPlan && todayPlan.tasks.length === 0 ? (
            <section className="today-plan-empty">
              <BookOpen className="h-10 w-10 text-emerald-600" />
              <h2>Hôm nay chưa có nhiệm vụ</h2>
              <p>Khám phá khóa học hoặc làm một quiz ngắn để EduPro tạo kế hoạch phù hợp hơn.</p>
              <Link to="/quiz" className="edu-primary-action">Làm quiz ngắn</Link>
            </section>
          ) : todayPlan ? (
            <>
              <section className="today-plan-hero">
                <div>
                  <div className="edu-card-label">
                    <Flame className="h-4 w-4" />
                    Kế hoạch hôm nay
                  </div>
                  <h2>{todayPlan.completedTasks}/{todayPlan.totalTasks} nhiệm vụ hoàn thành</h2>
                  <p>
                    Hoàn thành checklist ngắn này để giữ nhịp học và duy trì chuỗi ngày của bạn.
                  </p>
                  <div className="edu-lesson-meta">
                    <span><Clock className="h-4 w-4" />{todayPlan.estimatedMinutes} phút</span>
                    <span><Flame className="h-4 w-4" />{todayPlan.streak.current} ngày liên tiếp</span>
                    <span><Target className="h-4 w-4" />Kỷ lục {todayPlan.streak.longest} ngày</span>
                  </div>
                  {primaryTodayTask && (
                    <Link to={primaryTodayTask.targetUrl} className="edu-primary-action">
                      Bắt đầu học
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                <div
                  className="today-plan-progress"
                  style={{ '--today-progress': `${Math.round((todayPlan.completedTasks / Math.max(todayPlan.totalTasks, 1)) * 100)}%` } as React.CSSProperties}
                  aria-label={`Tiến độ hôm nay: ${Math.round((todayPlan.completedTasks / Math.max(todayPlan.totalTasks, 1)) * 100)}%`}
                >
                  <strong>{Math.round((todayPlan.completedTasks / Math.max(todayPlan.totalTasks, 1)) * 100)}%</strong>
                  <span>Daily plan</span>
                </div>
              </section>

              <section className="today-plan-task-grid">
                {todayPlan.tasks.map((task) => (
                  <TodayPlanTaskCard key={task.id} task={task} />
                ))}
              </section>
            </>
          ) : null}
        </main>

        <section className="edu-path-toolbar">
          <div>
            <h2>Lộ trình học</h2>
            <p>Đi theo từng chặng nhỏ thay vì phải tự tìm điểm bắt đầu.</p>
          </div>

          <div className="category-scroll">
            <button
              type="button"
              onClick={() => setSelectedLanguage(null)}
              aria-pressed={selectedLanguage === null}
              className={clsx('chip', selectedLanguage === null && 'active')}
            >
              Tất cả
            </button>
            {languages.map((language) => (
              <button
                type="button"
                key={language.id}
                onClick={() => setSelectedLanguage(language.id)}
                aria-pressed={selectedLanguage === language.id}
                className={clsx('chip', selectedLanguage === language.id && 'active')}
              >
                {language.name}
              </button>
            ))}
          </div>
        </section>

        <section className="education-learning-path">
          {isLoadingCourses ? (
            <div className="edu-loading-path">
              <div className="h-10 w-10 rounded-full border-2 border-emerald-400/30 border-t-emerald-500 animate-spin" />
            </div>
          ) : (
            <>
              {pathCourses.map((course, index: number) => (
                <Link
                  key={course.id}
                  to={`/education/courses/${course.id}`}
                  className={clsx('path-node', index === 0 && 'active')}
                >
                  <div className="path-node-index">
                    {index === 0 ? (
                      <Play className="h-5 w-5 fill-current" />
                    ) : index < 3 ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <GraduationCap className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="path-node-step">Chặng {index + 1}</p>
                    <h3>{course.title}</h3>
                    <p>
                      {course.language?.name || 'Ngôn ngữ'} • {course.totalLessons || 0} bài học
                    </p>
                  </div>
                  <span>{index === 0 ? 'Bắt đầu' : 'Xem'}</span>
                </Link>
              ))}

              {pathCourses.length === 0 && (
                <div className="edu-empty-path">
                  <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-400" />
                  <p>Chưa có khóa học phù hợp.</p>
                  <span>Thử đổi bộ lọc hoặc tìm bằng từ khóa khác.</span>
                </div>
              )}
            </>
          )}
        </section>

        <section className="edu-course-library">
          <div className="edu-library-header">
            <div>
              <h2>Thư viện khóa học</h2>
              <p>Dùng khi muốn khám phá thêm ngoài lộ trình hôm nay.</p>
            </div>
            <div className="edu-mini-stats">
              <span>{coursesData?.total || 0} khóa học</span>
              <span>{languages.length} ngôn ngữ</span>
            </div>
          </div>

          <div className="edu-course-grid">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/education/courses/${course.id}`}
                className="edu-course-card"
              >
                <div className="edu-course-flag">
                  {course.language?.flag || <GraduationCap className="h-5 w-5" />}
                </div>
                <div>
                  <p>{course.level}</p>
                  <h3>{course.title}</h3>
                  <span>{course.totalLessons || 0} bài học</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TodayPlanTaskCard({ task }: { task: TodayPlanTask }) {
  const iconByType: Record<TodayPlanTask['type'], ReactNode> = {
    continue_lesson: <Play className="h-5 w-5" />,
    review_flashcards: <BookOpen className="h-5 w-5" />,
    quick_quiz: <Sparkles className="h-5 w-5" />,
    fix_mistakes: <Target className="h-5 w-5" />,
  };

  return (
    <Link
      to={task.targetUrl}
      className={clsx('today-plan-task', task.completed && 'completed')}
      aria-label={`${task.title}. ${task.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}. ${task.estimatedMinutes} phút`}
    >
      <div className="edu-study-icon">{iconByType[task.type]}</div>
      <div>
        <h3>{task.title}</h3>
        <p>{task.description}</p>
      </div>
      <span>{task.estimatedMinutes} phút</span>
    </Link>
  );
}
