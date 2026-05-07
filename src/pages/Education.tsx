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
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { getCourses, getLanguages, getUserProgress } from '@/api/education.api';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui';
import type { Course } from '@/types/education.types';
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
  const { data: userProgress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: getUserProgress,
    enabled: isAuthenticated,
  });

  const courses: Course[] = coursesData?.items || [];
  const totalPages = coursesData?.totalPages || 1;
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const nextCourse = filteredCourses[0];
  const pathCourses = filteredCourses.slice(0, 6);

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

        <main className="edu-learning-grid">
          <section className="edu-next-lesson">
            <div className="edu-card-label">
              <Play className="h-4 w-4" />
              Bài tiếp theo
            </div>
            <h2>{nextCourse?.title || 'Chọn khóa học để bắt đầu'}</h2>
            <p>
              {nextCourse
                ? `${nextCourse.language?.name || 'Ngôn ngữ'} • ${nextCourse.totalLessons || 0} bài học`
                : 'Khi có khóa học, bài học tiếp theo sẽ xuất hiện tại đây.'}
            </p>

            <div className="edu-lesson-meta">
              <span>
                <Clock className="h-4 w-4" />
                {nextCourse ? `${nextCourse.estimatedHours || 0} giờ nội dung` : 'Theo khóa học bạn chọn'}
              </span>
              <span>
                <Target className="h-4 w-4" />
                {nextCourse ? `${nextCourse.totalLessons || 0} bài học trong khóa` : 'Mở khóa học để xem chi tiết'}
              </span>
            </div>

            <Link
              to={nextCourse ? `/education/courses/${nextCourse.id}` : '/education'}
              className="edu-primary-action"
            >
              Vào học ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <aside className="edu-study-today">
            <StudyCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Ôn tập hôm nay"
              detail="Flashcards đến hạn"
              value={isAuthenticated ? 'Mở ôn tập' : 'Xem flashcards'}
              to="/flashcards/review"
            />
            <StudyCard
              icon={<Sparkles className="h-5 w-5" />}
              title="Điểm yếu cần luyện"
              detail="Quiz sai gần đây"
              value={isAuthenticated ? 'Xem quiz' : 'Khám phá quiz'}
              to="/quiz"
            />
            <StudyCard
              icon={<Flame className="h-5 w-5" />}
              title="Chuỗi học"
              detail="Duy trì thói quen"
              value={`${userProgress?.streak?.currentStreak || 0} ngày`}
              to="/quiz/stats"
            />
          </aside>
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

function StudyCard({
  icon,
  title,
  detail,
  value,
  to,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  value: string;
  to: string;
}) {
  return (
    <Link to={to} className="edu-study-card">
      <div className="edu-study-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
      <span>{value}</span>
    </Link>
  );
}
