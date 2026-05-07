import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const readSource = (relativePath: string) =>
  readFileSync(join(root, '..', relativePath), 'utf8');

test('sidebar navigation is grouped around learning workflows', () => {
  const navConfig = readSource('src/components/layout/navConfig.tsx');
  const sidebar = readSource('src/components/layout/Sidebar.tsx');

  assert.match(navConfig, /learningNavSections/);
  assert.match(navConfig, /title: 'Học tập'/);
  assert.match(navConfig, /title: 'Tiến độ'/);
  assert.match(navConfig, /title: 'Cộng đồng'/);
  assert.match(navConfig, /title: 'Tài khoản'/);
  assert.match(sidebar, /learningNavSections\.map/);
  assert.doesNotMatch(sidebar, /TrendingUp/);
  assert.match(sidebar, /GraduationCap/);
});

test('education dashboard is learner-first instead of marketing-first', () => {
  const education = readSource('src/pages/Education.tsx');

  assert.match(education, /Hôm nay học gì\?/);
  assert.match(education, /Bài tiếp theo/);
  assert.match(education, /Lộ trình học/);
  assert.match(education, /Ôn tập hôm nay/);
  assert.match(education, /Điểm yếu cần luyện/);
  assert.match(education, /education-learning-path/);
  assert.match(education, /path-node/);
  assert.doesNotMatch(education, /Education Hub|AI-Powered Learning|Master Languages|Premium 3D Graphic|Ask AI Tutor/);
  assert.doesNotMatch(education, /Math\.random/);
  assert.doesNotMatch(education, /learning-panel/);
});

test('primary learning pages use Vietnamese action copy and calmer surfaces', () => {
  const flashcards = readSource('src/pages/FlashcardDecks.tsx');
  const quiz = readSource('src/pages/quiz/QuizListPage.tsx');

  assert.match(flashcards, /Bộ flashcard/);
  assert.match(flashcards, /Ôn tập hôm nay/);
  assert.match(flashcards, /Tạo bộ thẻ/);
  assert.doesNotMatch(flashcards, /Flashcard Decks|Daily Review|Create Deck|hover:scale-105|shadow-\[0_0_20px/);

  assert.match(quiz, /Trung tâm luyện tập/);
  assert.match(quiz, /Lịch sử làm bài/);
  assert.match(quiz, /Tạo quiz/);
  assert.doesNotMatch(quiz, /Quiz Center|Create Quiz|Detailed Stats|All Quizzes|from-accent-600 to-fuchsia-600/);
});

test('quiz detail keeps preview learner-safe and localized', () => {
  const quizDetail = readSource('src/pages/quiz/QuizDetailPage.tsx');

  assert.match(quizDetail, /Bắt đầu làm bài/);
  assert.match(quizDetail, /Câu hỏi mẫu/);
  assert.doesNotMatch(quizDetail, /Bat dau lam bai|Cau hoi mau/);
  assert.doesNotMatch(quizDetail, /Correct Answer:/);

  const questionLabelCount =
    quizDetail.match(/<dt className="text-slate-400">Questions<\/dt>/g)?.length ?? 0;

  assert.equal(questionLabelCount, 1);
});

test('quiz detail offline HSK flow keys off stable offline quiz ids', () => {
  const quizDetail = readSource('src/pages/quiz/QuizDetailPage.tsx');

  assert.match(quizDetail, /quiz\?\.id === 'offline-quiz-hsk1' \|\| quiz\?\.id === 'offline-quiz-hsk2'/);
  assert.doesNotMatch(quizDetail, /quiz\?\.topic === 'HSK1'|quiz\?\.topic === 'HSK2'/);
});

test('shared shell is education-first instead of stock-first', () => {
  const layout = readSource('src/components/layout/Layout.tsx');
  const header = readSource('src/components/layout/Header.tsx');
  const navConfig = readSource('src/components/layout/navConfig.tsx');
  const sidebar = readSource('src/components/layout/Sidebar.tsx');

  assert.doesNotMatch(layout, /stock-redesign\.css/);
  assert.match(navConfig, /Hôm nay|Khóa học|Flashcards|Quiz|Tài liệu|Tiến độ/);
  assert.doesNotMatch(header, /portfolio|market|trading|watchlist/i);
  assert.match(layout, /if \(authPaths\.includes\(location\.pathname\)\) \{/);
  assert.doesNotMatch(layout, /if \(!isAuthenticated && authPaths\.includes\(location\.pathname\)\) \{/);
  assert.match(navConfig, /label: 'Hôm nay',[\s\S]*to: '\/education',[\s\S]*matcher: \(\{ pathname, search \}\) => pathname === '\/education' && search !== '\?view=courses'/);
  assert.match(navConfig, /label: 'Khóa học',[\s\S]*to: '\/education\?view=courses',[\s\S]*matcher: \(\{ pathname, search \}\) => pathname === '\/education' && search === '\?view=courses'/);
  assert.doesNotMatch(navConfig, /to: '\/education\/courses\/all'/);
  assert.match(sidebar, /item\.matcher\s*\?\s*item\.matcher\(\{ pathname: location\.pathname, search: location\.search \}\)\s*:\s*routeIsActive/);
});

test('education home avoids fake learning metrics', () => {
  const education = readSource('src/pages/Education.tsx');

  assert.doesNotMatch(education, /15 phút/);
  assert.doesNotMatch(education, /Hoàn thành 1 bài/);
  assert.doesNotMatch(education, /value="Due"/);
  assert.doesNotMatch(education, /value="Quiz"/);
  assert.match(education, /value=\{isAuthenticated \? 'Mở ôn tập' : 'Xem flashcards'\}/);
  assert.match(education, /value=\{isAuthenticated \? 'Xem quiz' : 'Khám phá quiz'\}/);
});

test('course and lesson pages avoid fake xp and placeholder progress copy', () => {
  const courseDetail = readSource('src/pages/CourseDetail.tsx');
  const lessonView = readSource('src/pages/LessonView.tsx');

  assert.doesNotMatch(courseDetail, /1,450/);
  assert.match(courseDetail, /Quay lại khóa học/);
  assert.match(courseDetail, /Tiếp tục học/);
  assert.doesNotMatch(courseDetail, /Back to Courses|Resume Learning|Overall Progress|Course Syllabus/);
  assert.doesNotMatch(courseDetail, /<Link to=\{locked \? '#' : `\/education\/lessons\/\$\{lesson\.id\}`\}[\s\S]*<button/);

  assert.doesNotMatch(lessonView, /const progress = 0/);
  assert.match(lessonView, /Quay lại khóa học/);
  assert.match(lessonView, /Nội dung bài học/);
  assert.match(lessonView, /Từ vựng/);
  assert.match(lessonView, /Bài tập/);
  assert.doesNotMatch(lessonView, /'Back to Course'|'Lesson Content'|'Vocabulary'|'Exercises'|'Mark Complete'|"Back to Course"|"Lesson Content"|"Vocabulary"|"Exercises"|"Mark Complete"/);
});

test('core quiz flow is localized for learners', () => {
  const quizSession = readSource('src/pages/quiz/QuizSessionPage.tsx');
  const quizResult = readSource('src/pages/quiz/QuizResultPage.tsx');
  const quizStats = readSource('src/pages/quiz/QuizStatsPage.tsx');
  const quizCard = readSource('src/components/quiz/QuizCard.tsx');

  assert.doesNotMatch(quizSession, /Session Error|Back to Quizzes|Submit Answer|Type your answer/);
  assert.match(quizSession, /Không thể bắt đầu phiên quiz|Không thể hoàn thành quiz|Không thể nộp câu trả lời|Lỗi phiên làm bài|Không thể tải phiên quiz|Nhập câu trả lời|Nộp câu trả lời/);
  assert.doesNotMatch(quizSession, /currentQuestion\.type\.replace\('_', ' '\)/);
  assert.doesNotMatch(quizResult, /Congratulations!|Keep Practicing!|Try Again|All Quizzes|Questions You Missed/);
  assert.match(quizResult, /Không tìm thấy kết quả|Không thể tải kết quả quiz|Chúc mừng bạn|Tiếp tục luyện tập|Tất cả quiz|Câu hỏi cần xem lại/);
  assert.doesNotMatch(quizResult, /session\.status\.toLowerCase\(\)/);
  assert.doesNotMatch(quizStats, /Quiz Statistics|Track your performance and progress|Score History|Recent Attempts|Passed|Failed/);
  assert.match(quizStats, /Thống kê quiz|Theo dõi kết quả và tiến độ của bạn|Lịch sử điểm số|Lần làm bài gần đây|Bạn chưa làm quiz nào|Bắt đầu quiz đầu tiên|Chủ đề|Ngày|Điểm|Kết quả|Thời gian/);
  assert.doesNotMatch(quizCard, /label: 'Easy'|label: 'Medium'|label: 'Hard'|label: 'Mixed'|return 'Multiple Choice'|return 'Fill Blank'|>Questions<|>Time<|>Pass<|\? 'Public' : 'Private'|>Start</);
  assert.match(quizCard, /'Dễ'|'Trung bình'|'Khó'|'Tổng hợp'|'Trắc nghiệm'|'Điền vào chỗ trống'|'Câu hỏi'|'Thời gian'|'Đạt'|'Công khai'|'Riêng tư'|'Bắt đầu'/);
});
