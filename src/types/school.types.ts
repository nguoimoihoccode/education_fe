// Types for the School Platform (docs/SCHOOL_PLATFORM_PLAN.md Phase 1).
// Mirrors education_be/src/modules/school entities as serialized by the API
// (user relations arrive redacted — never carries passwordHash).

// ---------- core school ----------

export interface PublicUser {
  id: number;
  name: string | null;
  email: string;
  avatar?: string;
}

export interface PeriodConfig {
  periodsPerDay: number;
  /** Plan weekday numbering (matches BE): 1 = Chủ nhật, 2..7 = Thứ 2..Thứ 7 */
  days: number[];
}

export interface School {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  currentAcademicYearId?: string | null;
  principalId?: number | null;
  principal?: PublicUser | null;
  periodConfig: PeriodConfig;
  createdAt: string;
  updatedAt: string;
}

// ---------- academic years ----------

export interface AcademicYear {
  id: string;
  name: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  isActive: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicYearDto {
  name: string;
  startDate: string;
  endDate: string;
  makeActive?: boolean;
}

// ---------- subjects ----------

export interface Subject {
  id: string;
  name: string;
  code: string;
  color?: string | null;
  description?: string | null;
  active: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectDto {
  name: string;
  code: string;
  color?: string;
  description?: string;
}

export type UpdateSubjectDto = Partial<CreateSubjectDto>;

// ---------- classes ----------

export interface SchoolClass {
  id: string;
  name: string;
  grade: number;
  academicYearId: string;
  academicYear?: AcademicYear;
  homeroomTeacherId?: number | null;
  homeroomTeacher?: PublicUser | null;
  maxStudents?: number | null;
  room?: string | null;
  active: boolean;
  schoolId: string;
  /** Attached by listClasses (active memberships) */
  studentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassDto {
  name: string;
  grade: number;
  academicYearId: string;
  homeroomTeacherId?: number;
  maxStudents?: number;
  room?: string;
}

export type UpdateClassDto = Partial<CreateClassDto>;

// ---------- teaching assignments ----------

export interface TeachingAssignment {
  id: string;
  teacherId: number;
  teacher?: PublicUser;
  subjectId: string;
  subject?: Subject;
  classId: string;
  schoolClass?: SchoolClass;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentDto {
  teacherId: number;
  subjectId: string;
  classId: string;
}

/** Grouped teacher view from GET /school/teachers */
export interface TeacherRow {
  id: number;
  name: string | null;
  email: string;
  assignments: Array<{
    assignmentId: string;
    className: string;
    subjectName: string;
  }>;
}

// ---------- roster ----------

export interface RosterStudent {
  membershipId: string;
  joinedAt: string;
  student: {
    id: number;
    name: string | null;
    email: string;
  };
}

export interface StudentEntryDto {
  email: string;
  name?: string;
}

export interface AddStudentsDto {
  students: StudentEntryDto[];
  /** When true, unknown emails are skipped instead of getting new accounts */
  existingOnly?: boolean;
}

export interface AddStudentsResult {
  added: Array<{ email: string; studentId: number }>;
  /** New accounts — temporaryPassword is shown ONCE by the API response */
  created: Array<{
    email: string;
    studentId: number;
    temporaryPassword: string;
  }>;
  skipped: Array<{ email: string; reason: string }>;
}

// ---------- stats ----------

export interface SchoolStats {
  classes: number;
  students: number;
  teachers: number;
  subjects: number;
  /** Phase 4: điểm TB toàn trường 0–10 (null khi chưa có đầu điểm nào) */
  avgScore: number | null;
  /** Phase 4: % chuyên cần 30 ngày gần nhất */
  attendanceRate: number;
  /** Số lượt điểm danh đã chấm trong 30 ngày */
  attendanceSessions: number;
}

// ---------- parent links (Phase 2 — invite flow D5) ----------

export type ParentRelation = 'father' | 'mother' | 'guardian';
/** pending = chờ GVCN duyệt (hoặc chưa nhập mã); approved = kết nối sống */
export type ParentLinkStatus = 'pending' | 'approved' | 'revoked';

/** Row from GET /school/teaching/classes/:id/parents (managed by GVCN) */
export interface ClassParentRow {
  linkId: string;
  inviteCode: string;
  status: ParentLinkStatus;
  relation: ParentRelation;
  parentName: string | null;
  parentPhone: string | null;
  student: { id: number; name: string | null; email: string };
  /** null = phụ huynh chưa dùng mã mời */
  parent: { id: number; name: string | null; email: string } | null;
  createdAt: string;
}

export interface InviteParentDto {
  studentId: number;
  relation: ParentRelation;
  parentName?: string;
  parentPhone?: string;
}

/** Serialized ParentLink returned by invite/approve/revoke endpoints */
export interface ParentLinkRow {
  id: string;
  schoolId: string;
  parentId: number | null;
  studentId: number;
  relation: ParentRelation;
  parentName?: string | null;
  parentPhone?: string | null;
  inviteCode: string;
  status: ParentLinkStatus;
  createdAt: string;
  updatedAt: string;
  student?: { id: number; name: string | null; email: string };
}

/** Response of POST /parent/claim — roles lets the FE refresh the auth store */
export interface ClaimInviteResult {
  linkId: string;
  status: ParentLinkStatus;
  childName: string | null;
  roles: string[];
}

/** Row from GET /parent/children */
export interface MyChild {
  linkId: string;
  studentId: number;
  childName: string | null;
  relation: ParentRelation;
  status: ParentLinkStatus;
  classId: string | null;
  className: string | null;
  grade: number | null;
  academicYear: string | null;
}

/** Response of GET /parent/children/:studentId (approved links only) */
export interface ChildProfile {
  child: { id: number; name: string | null };
  relation: ParentRelation;
  class: {
    id: string;
    name: string;
    grade: number;
    room: string | null;
    academicYear: string | null;
    schoolName: string | null;
    homeroomTeacher: { id: number; name: string | null; email: string } | null;
  } | null;
}

// ---------- timetable (Phase 3) ----------

/** One grid cell as serialized by GET /timetable* endpoints. */
export interface TimetableSlotView {
  id: string;
  weekday: number; // 1 = Chủ nhật, 2..7 = Thứ 2..Thứ 7
  periodNumber: number;
  room: string | null;
  subject: { id: string; name: string; code: string; color: string | null };
  teacher: { id: number; name: string | null };
  /** only on GET /timetable/me for teachers (slots span classes) */
  className?: string;
}

export interface ClassTimetable {
  classId: string;
  className: string;
  grade: number;
  academicYear: string | null;
  periodConfig: PeriodConfig;
  slots: TimetableSlotView[];
}

export interface MyTimetable {
  as: 'teacher' | 'student';
  periodConfig: PeriodConfig;
  class?: { id: string; name: string; grade: number; academicYear: string | null };
  slots: TimetableSlotView[];
}

export interface TimetableSlotInput {
  classId: string;
  subjectId: string;
  teacherId: number;
  weekday: number;
  periodNumber: number;
  room?: string;
}

export interface TimetableConflict {
  dimension: 'teacher' | 'class' | 'room';
  weekday: number;
  periodNumber: number;
  indices: number[];
  message: string;
}

export interface PeriodConfigInput {
  periodsPerDay: number;
  days: number[];
}

/** Response of GET /parent/children/:studentId/timetable */
export interface ChildTimetable {
  child: { id: number; name: string | null };
  class: { id: string; name: string; grade: number } | null;
  periodConfig: PeriodConfig;
  slots: TimetableSlotView[];
}

// ---------- attendance (Phase 3) ----------

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

/** Row of the quick attendance sheet (GET /attendance/session) */
export interface AttendanceSessionStudent {
  studentId: number;
  name: string | null;
  email: string;
  /** null = chưa chấm tiết này */
  status: AttendanceStatus | null;
  note: string | null;
}

export interface AttendanceSession {
  classId: string;
  className: string;
  date: string;
  weekday: number;
  periodNumber: number;
  slot: { subjectName: string | null; color: string | null; teacherName: string | null } | null;
  students: AttendanceSessionStudent[];
}

export interface TakeAttendanceInput {
  classId: string;
  date: string;
  periodNumber: number;
  records: Array<{ studentId: number; status: AttendanceStatus; note?: string }>;
}

export interface TakeAttendanceResult {
  classId: string;
  date: string;
  periodNumber: number;
  saved: number;
  created: number;
  updated: number;
}

/** Output of the pure attendance-rate policy */
export interface AttendanceSummary {
  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  /** 0..100, one decimal */
  attendanceRate: number;
  unexcusedAbsences: number;
}

export interface ClassAttendanceHistory {
  records: Array<{
    recordId: string;
    studentId: number;
    studentName: string | null;
    date: string;
    periodNumber: number;
    status: AttendanceStatus;
    note: string | null;
  }>;
  summary: AttendanceSummary;
}

/** Response of GET /parent/children/:studentId/attendance — no emails/ids */
export interface ChildAttendance {
  summary: AttendanceSummary;
  records: Array<{
    date: string;
    periodNumber: number;
    status: AttendanceStatus;
    note: string | null;
  }>;
}

// ---------- grades (Phase 4 — sổ điểm) ----------

export type GradeTestType = 'oral' | '15min' | '45min' | 'final';

/** Một đầu điểm — view của GradeEntry (BE grades.service GradeEntryView). */
export interface GradeEntryView {
  id: string;
  classId: string;
  subjectId: string;
  subjectName: string | null;
  studentId: number;
  studentName: string | null;
  testType: GradeTestType;
  coefficient: number;
  score: number;
  date: string;
  term: number;
  quizSessionId: string | null;
  /** not-null = đầu điểm tự sinh từ BTVN */
  homeworkId: string | null;
}

/** Output of the pure grade-average policy. */
export interface GradeAverages {
  byType: Partial<Record<GradeTestType, number>>;
  midterm: number | null;
  final: number | null;
  year: number | null;
  totalEntries: number;
}

export interface CreateGradeInput {
  classId: string;
  subjectId: string;
  studentId: number;
  testType: GradeTestType;
  score: number;
  date: string;
  /** bỏ trống → BE suy từ testType (15p/miệng ×1, 45p/cuối ×2) */
  coefficient?: number;
  term?: number;
}

export type UpdateGradeInput = Partial<Omit<CreateGradeInput, 'classId'>>;

export interface GradeReportRow extends GradeAverages {
  studentId: number;
  studentName: string | null;
  entries: GradeEntryView[];
}

/** GET /grades/report?classId&subjectId&term */
export interface GradeReport {
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  term: number | null;
  rows: GradeReportRow[];
}

export interface SubjectGrades extends GradeAverages {
  subjectId: string;
  subjectName: string | null;
  term: number;
  entries: GradeEntryView[];
  /** hạng cạnh tranh 1224 trong lớp ở môn × HK này; null = chưa có điểm xếp */
  rank: number | null;
  /** số bạn được xếp hạng cùng môn × HK */
  rankedCount: number;
}

/** GET /grades/me và GET /parent/children/:id/grades — cùng shape. */
export interface StudentGrades {
  studentId: number;
  subjects: SubjectGrades[];
}

/** Một dòng bảng xếp hạng — GET /grades/ranking. */
export interface GradeRankingRow {
  rank: number | null;
  studentId: number;
  studentName: string | null;
  /** điểm xếp hạng: TB cả năm ?? giữa kỳ (toàn lớp = TB các môn); null = chưa có */
  average: number | null;
}

export interface GradeRanking {
  classId: string;
  className: string;
  /** null = xếp hạng toàn lớp */
  subjectId: string | null;
  subjectName: string | null;
  term: number | null;
  rows: GradeRankingRow[];
  rankedCount: number;
  unrankedCount: number;
}

// ---------- homework (Phase 4 — BTVN nối Learning Hub) ----------

export type HomeworkTargetType = 'quiz' | 'deck';

export interface HomeworkView {
  id: string;
  schoolId: string;
  classId: string;
  className: string | null;
  subjectId: string;
  subjectName: string | null;
  teacherId: number;
  teacherName: string | null;
  title: string;
  dueDate: string;
  targetType: HomeworkTargetType;
  targetId: string;
  countsAsGrade: boolean;
  createdAt: string;
}

export interface CreateHomeworkInput {
  classId: string;
  subjectId: string;
  title: string;
  /** ISO datetime — deadline có cả giờ */
  dueDate: string;
  targetType: HomeworkTargetType;
  targetId: string;
  countsAsGrade?: boolean;
}

export interface StudentHomeworkRow extends HomeworkView {
  overdue: boolean;
}

/** GET /me/homework */
export interface MyHomework {
  homework: StudentHomeworkRow[];
  /** đầu điểm tự sinh — FE tick "đã làm" + hiện điểm */
  graded: Array<{
    homeworkId: string | null;
    quizSessionId: string | null;
    score: number;
  }>;
}

/** Row of GET /parent/children/:id/homework — không có id HS/GV */
export interface ChildHomeworkRow {
  id: string;
  title: string;
  className: string | null;
  subjectName: string | null;
  teacherName: string | null;
  dueDate: string;
  targetType: HomeworkTargetType;
  targetId: string;
  countsAsGrade: boolean;
}
