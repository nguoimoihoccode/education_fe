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
  assert.match(navConfig, /title: 'Học hôm nay'/);
  assert.match(navConfig, /label: 'Tiến độ'/);
  assert.match(navConfig, /title: 'Tài khoản'/);
  assert.doesNotMatch(navConfig, /title: 'Cộng đồng'/);
  assert.match(sidebar, /learningNavSections\.map/);
  assert.doesNotMatch(sidebar, /TrendingUp/);
  assert.match(sidebar, /GraduationCap/);

  // admin areas must be role-gated: principal nav items carry roles and the
  // sidebar filters against the signed-in user's roles (SCHOOL_PLATFORM_PLAN Phase 1)
  assert.match(navConfig, /title: 'Quản trị trường'/);
  assert.match(navConfig, /roles\?: string\[\]/);
  assert.match(navConfig, /to: '\/principal'[\s\S]*roles: \['principal', 'admin'\]/);
  assert.match(sidebar, /item\.roles/);
  assert.match(sidebar, /useAuthStore/);
});

test('phase 2 teaching hub and parent portal are role-aware', () => {
  const navConfig = readSource('src/components/layout/navConfig.tsx');
  const routes = readSource('src/config/routes.ts');
  const api = readSource('src/api/school.api.ts');
  const app = readSource('src/App.tsx');

  // The GVCN hub and the parent portal are deliberately NOT role-gated: reads
  // are open to any signed-in user and the server scopes them per relationship,
  // so a caller with no school sees an empty notice instead of a hidden menu.
  // The write affordances are gated client-side instead (see the test below).
  assert.match(navConfig, /title: 'Lớp của tôi'/);
  assert.match(navConfig, /to: '\/teaching' \}/);
  assert.doesNotMatch(navConfig, /to: '\/teaching', roles/);
  assert.match(navConfig, /title: 'Con của tôi'/);
  assert.match(navConfig, /to: '\/parent' \}/);
  assert.doesNotMatch(navConfig, /to: '\/parent', roles/);
  assert.match(routes, /TEACHING_CLASS: \(id: string\) => `\/teaching\/classes\/\$\{id\}`/);
  assert.match(routes, /PARENT_CHILD: \(id: number \| string\) => `\/parent\/children\/\$\{id\}`/);
  assert.doesNotMatch(app, /roles=\{\['teacher', 'principal', 'admin'\]\}/);
  assert.match(app, /path="\/teaching"\s*\n\s*element=\{\s*\n\s*<ProtectedRoute>/);
  assert.match(
    app,
    /path="\/parent\/children\/:studentId"\s*\n\s*element=\{\s*\n\s*<ProtectedRoute>/,
  );

  // API surface mirrors the backend (school/teaching + parent controllers)
  assert.match(api, /\/school\/teaching\/classes/);
  assert.match(api, /parents\/invite/);
  assert.match(api, /\/parent\/claim/);
});

test('phase 3 timetable builder and attendance are wired end-to-end', () => {
  const navConfig = readSource('src/components/layout/navConfig.tsx');
  const routes = readSource('src/config/routes.ts');
  const api = readSource('src/api/school.api.ts');
  const app = readSource('src/App.tsx');
  const query = readSource('src/config/query.ts');
  const types = readSource('src/types/school.types.ts');
  const grid = readSource('src/components/school/timetable-meta.ts');

  // Routes + guards: only school admins build the timetable; everyone signed in
  // reads their own grid (teachers their slots, students their class) and the
  // attendance sheet stays relationship-scoped on the BE.
  assert.match(navConfig, /to: '\/principal\/timetable', roles: \['principal', 'admin'\]/);
  assert.match(navConfig, /to: '\/teaching\/timetable' \}/);
  assert.doesNotMatch(navConfig, /to: '\/teaching\/timetable', roles/);
  assert.match(navConfig, /to: '\/me\/school' \}/);
  assert.doesNotMatch(navConfig, /to: '\/me\/school', roles/);
  assert.match(routes, /TEACHING_ATTENDANCE: \(id: string\) => `\/teaching\/classes\/\$\{id\}\/attendance`/);
  assert.match(app, /path="\/principal\/timetable"/);
  assert.match(app, /path="\/teaching\/classes\/:id\/attendance"/);
  assert.match(app, /path="\/me\/school"\s*\n\s*element=\{\s*\n\s*<ProtectedRoute>/);

  // API + query keys mirror the BE timetable/attendance controllers
  assert.match(api, /apiClient\.get\(\s*"\/timetable",\s*\{\s*params: \{ classId \}/);
  assert.match(api, /\/timetable\/slots/);
  assert.match(api, /\/timetable\/validate/);
  assert.match(api, /school\/period-config/);
  assert.match(api, /\/attendance\/session/);
  assert.match(api, /\/attendance\/take/);
  assert.match(api, /\/parent\/children\/\$\{studentId\}\/timetable/);
  assert.match(query, /ATTENDANCE_SESSION: \(classId: string, date: string, period: number\)/);
  assert.match(types, /export type AttendanceStatus = 'present' \| 'absent' \| 'late' \| 'excused'/);

  // Weekday numbering must match the BE policy: 1 = Chủ nhật, 2..7 = Thứ 2..7
  assert.match(grid, /1: 'CN'/);
  assert.match(grid, /2: 'Thứ 2'/);
});

test('phase 4 gradebook, homework assignment and two-way parent/student views are wired', () => {
  const routes = readSource('src/config/routes.ts');
  const api = readSource('src/api/school.api.ts');
  const app = readSource('src/App.tsx');
  const query = readSource('src/config/query.ts');
  const types = readSource('src/types/school.types.ts');
  const meta = readSource('src/components/school/grades-meta.ts');
  const gradebook = readSource('src/pages/teacher/GradebookPage.tsx');
  const gradesPanel = readSource('src/components/school/StudentGradesPanel.tsx');
  const homework = readSource('src/pages/teacher/HomeworkPage.tsx');
  const classDetail = readSource('src/pages/teacher/TeacherClassDetailPage.tsx');
  const mySchool = readSource('src/pages/student/MySchoolPage.tsx');
  const childPage = readSource('src/pages/parent/ParentChildPage.tsx');
  const dashboard = readSource('src/pages/principal/PrincipalDashboard.tsx');

  // Routes + guards: gradebook/homework are staff-only per-class pages,
  // reachable from the homeroom class detail (Phase 4 plan §4.1/§4.5).
  assert.match(routes, /TEACHING_GRADES: \(id: string\) => `\/teaching\/classes\/\$\{id\}\/grades`/);
  assert.match(routes, /TEACHING_HOMEWORK: \(id: string\) => `\/teaching\/classes\/\$\{id\}\/homework`/);
  assert.match(routes, /return 'Sổ điểm';/);
  assert.match(routes, /return 'Giao bài tập';/);
  assert.match(app, /path="\/teaching\/classes\/:id\/grades"/);
  assert.match(app, /path="\/teaching\/classes\/:id\/homework"/);
  assert.match(classDetail, /ROUTES\.TEACHING_GRADES\(id\)/);
  assert.match(classDetail, /ROUTES\.TEACHING_HOMEWORK\(id\)/);

  // API surface mirrors the BE grades/homework controllers + quiz bridge paths.
  assert.match(api, /"\/grades"/);
  assert.match(api, /"\/grades\/report"/);
  assert.match(api, /"\/grades\/me"/);
  assert.match(api, /"\/grades\/ranking"/);
  assert.match(api, /\/parent\/children\/\$\{studentId\}\/grades/);
  assert.match(api, /"\/homework"/);
  assert.match(api, /"\/me\/homework"/);
  assert.match(api, /\/parent\/children\/\$\{studentId\}\/homework/);

  // Query keys + mirrored types (testType union matches BE GradeTestType)
  assert.match(query, /GRADE_REPORT: \(classId: string, subjectId: string, term\?: number\)/);
  assert.match(
    query,
    /GRADE_RANKING: \(classId: string, subjectId\?: string, term\?: number\)/,
  );
  assert.match(query, /MY_HOMEWORK: \['me', 'homework'\]/);
  assert.match(query, /CHILD_GRADES: \(studentId: number\)/);
  assert.match(types, /export type GradeTestType = 'oral' \| '15min' \| '45min' \| 'final'/);
  // Ranking contract: rows carry competition rank (null = chưa xếp hạng) and the
  // peer count; SubjectGrades rows embed rank so students/parents see it too.
  assert.match(types, /export interface GradeRanking \{/);
  assert.match(types, /rank: number \| null;/);
  assert.match(types, /rankedCount: number;/);
  // Coefficients must match DEFAULT_COEFFICIENT in education_be (15p/miệng ×1, 45p/cuối ×2)
  assert.match(meta, /'15min': 1/);
  assert.match(meta, /'45min': 2/);
  assert.match(meta, /final: 2/);

  // Gradebook computes midterm/year server-side; homework picks Learning Hub targets.
  assert.match(gradebook, /getGradeReport/);
  assert.match(gradebook, /TB giữa kỳ/);
  // Gradebook reuses subject/term pickers for the ranking panel (theo môn | toàn lớp).
  assert.match(gradebook, /getClassRanking/);
  assert.match(gradebook, /GRADE_RANKING/);
  assert.match(gradebook, /Xếp hạng/);
  assert.match(gradebook, /Toàn lớp/);
  // Students and parents get an inline "Hạng X/N" chip per subject card.
  assert.match(gradesPanel, /Hạng \{s\.rank\}\/\{s\.rankedCount\}/);
  assert.match(homework, /getQuizzes/);
  assert.match(homework, /getFlashcardDecks/);
  assert.match(homework, /countsAsGrade/);

  // Student sees Điểm + BTVN with a direct "Làm bài" CTA; parent gets both tabs too.
  assert.match(mySchool, /getMyGrades/);
  assert.match(mySchool, /getMyHomework/);
  assert.match(mySchool, /Làm bài/);
  assert.match(childPage, /getChildGrades/);
  assert.match(childPage, /getChildHomework/);

  // Principal dashboard shows the new school-wide quality stats.
  assert.match(dashboard, /avgScore/);
  assert.match(dashboard, /attendanceRate/);
});

test('education dashboard is learner-first instead of marketing-first', () => {
  const education = readSource('src/pages/Education.tsx');

  assert.match(education, /Hôm nay học gì\?/);
  assert.match(education, /học bài tiếp theo/);
  assert.match(education, /Lộ trình học/);
  assert.match(education, /ôn flashcards đến hạn/);
  assert.match(education, /luyện đúng điểm yếu/);
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

  assert.match(quizDetail, /Bắt đầu/);
  assert.match(quizDetail, /Câu hỏi mẫu/);
  assert.doesNotMatch(quizDetail, /Bat dau lam bai|Cau hoi mau/);
  assert.doesNotMatch(quizDetail, /Correct Answer:/);

  const questionLabelCount =
    quizDetail.match(/<dt className="text-slate-300">Số câu hỏi<\/dt>/g)?.length ?? 0;

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
  // Auth pages bypass the shell. The comparison must run on a normalized path,
  // because React Router resolves "/Login/" to path="/login" but a raw
  // location.pathname comparison would not match it.
  assert.match(layout, /const currentPath = normalizePath\(location\.pathname\)/);
  assert.match(layout, /if \(authPaths\.includes\(currentPath\) \|\| noLayoutPaths\.includes\(currentPath\)\) \{/);
  assert.doesNotMatch(layout, /if \(!isAuthenticated && authPaths\.includes\(location\.pathname\)\) \{/);
  assert.match(navConfig, /label: 'Hôm nay',[\s\S]*to: '\/today'/);
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
  assert.match(education, /Đăng nhập để nhận kế hoạch học mỗi ngày/);
  assert.match(education, /Làm quiz ngắn/);
  assert.match(education, /Bắt đầu học/);
});

test('course and lesson pages avoid fake xp and placeholder progress copy', () => {
  const courseDetail = readSource('src/pages/CourseDetail.tsx');
  const lessonView = readSource('src/pages/LessonView.tsx');

  assert.doesNotMatch(courseDetail, /1,450/);
  assert.match(courseDetail, /Quay lại khóa học/);
  assert.match(courseDetail, /primaryAction\.label/);
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

test('school reads are open to any signed-in user while writes stay staff-only', () => {
  const app = readSource('src/App.tsx');
  const navConfig = readSource('src/components/layout/navConfig.tsx');
  const hook = readSource('src/hooks/useCanWriteSchool.ts');
  const notice = readSource('src/components/school/NoSchoolNotice.tsx');
  const mySchool = readSource('src/pages/student/MySchoolPage.tsx');
  const gradebook = readSource('src/pages/teacher/GradebookPage.tsx');
  const homework = readSource('src/pages/teacher/HomeworkPage.tsx');
  const classDetail = readSource('src/pages/teacher/TeacherClassDetailPage.tsx');

  // No relationship-scoped route keeps a role list: the BE confines those reads
  // (and 404s a denial), and a caller with no school gets an empty notice rather
  // than a hidden menu. The school-wide /principal routes keep theirs, because
  // their reads have no per-object check -- GET /school/classes/:id/students
  // returns every student's email.
  assert.doesNotMatch(app, /roles=\{\['teacher', 'principal', 'admin'\]\}/);
  assert.doesNotMatch(app, /roles=\{\['student', 'admin'\]\}/);
  assert.match(app, /roles=\{\['principal', 'admin'\]\}/);
  assert.match(navConfig, /to: '\/principal\/classes', roles: \['principal', 'admin'\]/);

  // Writes mirror the BE @Roles(TEACHER, ...SCHOOL_ADMIN_ROLES) — hidden only so
  // the button cannot 404, never as the access decision itself.
  assert.match(hook, /SCHOOL_WRITE_ROLES = \['teacher', 'principal', 'admin'\]/);
  for (const page of [gradebook, homework, classDetail]) {
    assert.match(page, /useCanWriteSchool\(\)/);
  }
  // ClassAttendancePage has no gate on purpose: reading the sheet and saving it
  // run the same assertManageAccess, so any viewer is already a writer.
  assert.match(
    readSource('src/pages/teacher/ClassAttendancePage.tsx'),
    /No client-side write gate on this page/,
  );

  assert.match(notice, /Bạn chưa thuộc trường nào/);
  assert.match(mySchool, /NoSchoolNotice/);
});
