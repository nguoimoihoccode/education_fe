import { apiClient, CACHE_PROFILES } from "./client";
import type {
  School,
  SchoolStats,
  AcademicYear,
  Subject,
  SchoolClass,
  TeachingAssignment,
  TeacherRow,
  RosterStudent,
  AddStudentsDto,
  AddStudentsResult,
  CreateAcademicYearDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  CreateClassDto,
  UpdateClassDto,
  CreateAssignmentDto,
  ClassParentRow,
  InviteParentDto,
  ParentLinkRow,
  ClaimInviteResult,
  MyChild,
  ChildProfile,
  ClassTimetable,
  MyTimetable,
  TimetableSlotView,
  TimetableSlotInput,
  TimetableConflict,
  PeriodConfigInput,
  ChildTimetable,
  AttendanceSession,
  TakeAttendanceInput,
  TakeAttendanceResult,
  ClassAttendanceHistory,
  ChildAttendance,
  GradeEntryView,
  GradeReport,
  GradeRanking,
  CreateGradeInput,
  UpdateGradeInput,
  StudentGrades,
  HomeworkView,
  CreateHomeworkInput,
  MyHomework,
  ChildHomeworkRow,
} from "@/types/school.types";

// ==================== SCHOOL ====================

export const getMySchool = async (): Promise<School> => {
  const response = await apiClient.get("/school/me", CACHE_PROFILES.DYNAMIC);
  return response.data;
};

export const getSchoolStats = async (): Promise<SchoolStats> => {
  const response = await apiClient.get("/school/stats", CACHE_PROFILES.DYNAMIC);
  return response.data;
};

export const listTeachers = async (): Promise<TeacherRow[]> => {
  const response = await apiClient.get("/school/teachers", CACHE_PROFILES.DYNAMIC);
  return response.data;
};

// ==================== ACADEMIC YEARS ====================

export const listAcademicYears = async (): Promise<AcademicYear[]> => {
  const response = await apiClient.get("/school/academic-years", CACHE_PROFILES.STATIC);
  return response.data;
};

export const createAcademicYear = async (
  dto: CreateAcademicYearDto,
): Promise<AcademicYear> => {
  const response = await apiClient.post("/school/academic-years", dto);
  return response.data;
};

export const activateAcademicYear = async (id: string): Promise<void> => {
  await apiClient.post(`/school/academic-years/${id}/activate`);
};

// ==================== SUBJECTS ====================

export const listSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get("/school/subjects", CACHE_PROFILES.DYNAMIC);
  return response.data;
};

export const createSubject = async (dto: CreateSubjectDto): Promise<Subject> => {
  const response = await apiClient.post("/school/subjects", dto);
  return response.data;
};

export const updateSubject = async (
  id: string,
  dto: UpdateSubjectDto,
): Promise<Subject> => {
  const response = await apiClient.patch(`/school/subjects/${id}`, dto);
  return response.data;
};

export const deleteSubject = async (id: string): Promise<void> => {
  await apiClient.delete(`/school/subjects/${id}`);
};

// ==================== CLASSES ====================

export const listClasses = async (): Promise<SchoolClass[]> => {
  const response = await apiClient.get("/school/classes", CACHE_PROFILES.DYNAMIC);
  return response.data;
};

export const getClass = async (id: string): Promise<SchoolClass> => {
  const response = await apiClient.get(
    `/school/classes/${id}`,
    CACHE_PROFILES.DYNAMIC,
  );
  return response.data;
};

export const createClass = async (dto: CreateClassDto): Promise<SchoolClass> => {
  const response = await apiClient.post("/school/classes", dto);
  return response.data;
};

export const updateClass = async (
  id: string,
  dto: UpdateClassDto,
): Promise<SchoolClass> => {
  const response = await apiClient.patch(`/school/classes/${id}`, dto);
  return response.data;
};

export const deleteClass = async (id: string): Promise<void> => {
  await apiClient.delete(`/school/classes/${id}`);
};

// ==================== ROSTER ====================

export const getClassStudents = async (
  classId: string,
): Promise<RosterStudent[]> => {
  const response = await apiClient.get(
    `/school/classes/${classId}/students`,
    CACHE_PROFILES.NO_CACHE,
  );
  return response.data;
};

export const addClassStudents = async (
  classId: string,
  dto: AddStudentsDto,
): Promise<AddStudentsResult> => {
  const response = await apiClient.post(
    `/school/classes/${classId}/students`,
    dto,
  );
  return response.data;
};

export const removeClassStudent = async (
  classId: string,
  studentId: number,
): Promise<void> => {
  await apiClient.delete(`/school/classes/${classId}/students/${studentId}`);
};

// ==================== TEACHING ASSIGNMENTS ====================

export const listAssignments = async (opts?: {
  classId?: string;
  teacherId?: number;
}): Promise<TeachingAssignment[]> => {
  const response = await apiClient.get("/school/assignments", {
    params: opts,
    ...CACHE_PROFILES.DYNAMIC,
  });
  return response.data;
};

export const createAssignment = async (
  dto: CreateAssignmentDto,
): Promise<TeachingAssignment> => {
  const response = await apiClient.post("/school/assignments", dto);
  return response.data;
};

export const deleteAssignment = async (id: string): Promise<void> => {
  await apiClient.delete(`/school/assignments/${id}`);
};

// ==================== TEACHING HUB (GVCN — Phase 2) ====================

export const listMyHomeroomClasses = async (): Promise<SchoolClass[]> => {
  const response = await apiClient.get(
    "/school/teaching/classes",
    CACHE_PROFILES.DYNAMIC,
  );
  return response.data;
};

export const getHomeroomRoster = async (
  classId: string,
): Promise<RosterStudent[]> => {
  const response = await apiClient.get(
    `/school/teaching/classes/${classId}/students`,
    CACHE_PROFILES.NO_CACHE,
  );
  return response.data;
};

// ---------- class parents ----------

export const listClassParents = async (
  classId: string,
): Promise<ClassParentRow[]> => {
  const response = await apiClient.get(
    `/school/teaching/classes/${classId}/parents`,
    CACHE_PROFILES.NO_CACHE,
  );
  return response.data;
};

export const inviteClassParent = async (
  classId: string,
  dto: InviteParentDto,
): Promise<ParentLinkRow> => {
  const response = await apiClient.post(
    `/school/teaching/classes/${classId}/parents/invite`,
    dto,
  );
  return response.data;
};

export const approveParentLink = async (
  classId: string,
  linkId: string,
): Promise<ParentLinkRow> => {
  const response = await apiClient.post(
    `/school/teaching/classes/${classId}/parents/${linkId}/approve`,
  );
  return response.data;
};

export const revokeParentLink = async (
  classId: string,
  linkId: string,
): Promise<ParentLinkRow> => {
  const response = await apiClient.post(
    `/school/teaching/classes/${classId}/parents/${linkId}/revoke`,
  );
  return response.data;
};

// ==================== PARENT PORTAL (Phase 2) ====================

export const claimParentInvite = async (
  code: string,
): Promise<ClaimInviteResult> => {
  const response = await apiClient.post("/parent/claim", { code });
  return response.data;
};

export const getMyChildren = async (): Promise<MyChild[]> => {
  const response = await apiClient.get("/parent/children", CACHE_PROFILES.DYNAMIC);
  return response.data;
};

export const getMyChildProfile = async (studentId: number): Promise<ChildProfile> => {
  const response = await apiClient.get(
    `/parent/children/${studentId}`,
    CACHE_PROFILES.DYNAMIC,
  );
  return response.data;
};

// ==================== TIMETABLE (Phase 3) ====================

export const getTimetableForClass = async (
  classId: string,
): Promise<ClassTimetable> => {
  const response = await apiClient.get(
    "/timetable",
    { params: { classId }, ...CACHE_PROFILES.DYNAMIC },
  );
  return response.data;
};

export const getMyTimetable = async (): Promise<MyTimetable> => {
  const response = await apiClient.get("/timetable/me", CACHE_PROFILES.DYNAMIC);
  return response.data;
};

/** BE returns the saved slot view (relations already resolved). */
export const createTimetableSlot = async (
  dto: TimetableSlotInput,
): Promise<TimetableSlotView> => {
  const response = await apiClient.post("/timetable/slots", dto);
  return response.data;
};

export const deleteTimetableSlot = async (slotId: string): Promise<void> => {
  await apiClient.delete(`/timetable/slots/${slotId}`);
};

/** What-if conflict check (BE never saves). */
export const validateTimetable = async (
  slots: TimetableSlotInput[],
): Promise<{ conflicts: TimetableConflict[] }> => {
  const response = await apiClient.post("/timetable/validate", { slots });
  return response.data;
};

export const updatePeriodConfig = async (
  dto: PeriodConfigInput,
): Promise<void> => {
  await apiClient.patch("/school/period-config", dto);
};

// ==================== ATTENDANCE (Phase 3) ====================

export const getAttendanceSession = async (
  classId: string,
  date: string,
  periodNumber: number,
): Promise<AttendanceSession> => {
  const response = await apiClient.get("/attendance/session", {
    params: { classId, date, periodNumber },
    ...CACHE_PROFILES.NO_CACHE,
  });
  return response.data;
};

export const takeAttendance = async (
  dto: TakeAttendanceInput,
): Promise<TakeAttendanceResult> => {
  const response = await apiClient.post("/attendance/take", dto);
  return response.data;
};

export const getAttendanceHistory = async (
  classId: string,
  from: string,
  to: string,
): Promise<ClassAttendanceHistory> => {
  const response = await apiClient.get("/attendance", {
    params: { classId, from, to },
    ...CACHE_PROFILES.DYNAMIC,
  });
  return response.data;
};

// ---------- parent reads (Phase 3) ----------

export const getChildTimetable = async (
  studentId: number,
): Promise<ChildTimetable> => {
  const response = await apiClient.get(
    `/parent/children/${studentId}/timetable`,
    CACHE_PROFILES.DYNAMIC,
  );
  return response.data;
};

export const getChildAttendance = async (
  studentId: number,
): Promise<ChildAttendance> => {
  const response = await apiClient.get(
    `/parent/children/${studentId}/attendance`,
    CACHE_PROFILES.DYNAMIC,
  );
  return response.data;
};

// ==================== GRADES (Phase 4) ====================

export const listGrades = async (params?: {
  classId?: string;
  subjectId?: string;
  studentId?: number;
  term?: number;
}): Promise<GradeEntryView[]> => {
  const response = await apiClient.get("/grades", {
    params,
    ...CACHE_PROFILES.DYNAMIC,
  });
  return response.data;
};

export const getGradeReport = async (
  classId: string,
  subjectId: string,
  term?: number,
): Promise<GradeReport> => {
  const response = await apiClient.get("/grades/report", {
    params: { classId, subjectId, term },
    ...CACHE_PROFILES.DYNAMIC,
  });
  return response.data;
};

/** Xếp hạng theo môn (subjectId) hoặc toàn lớp (bỏ trống subjectId). */
export const getClassRanking = async (params: {
  classId: string;
  subjectId?: string;
  term?: number;
}): Promise<GradeRanking> => {
  const response = await apiClient.get("/grades/ranking", {
    params,
    ...CACHE_PROFILES.DYNAMIC,
  });
  return response.data;
};

export const createGrade = async (
  dto: CreateGradeInput,
): Promise<GradeEntryView> => {
  const response = await apiClient.post("/grades", dto);
  return response.data;
};

export const updateGrade = async (
  id: string,
  dto: UpdateGradeInput,
): Promise<GradeEntryView> => {
  const response = await apiClient.patch(`/grades/${id}`, dto);
  return response.data;
};

export const deleteGrade = async (id: string): Promise<void> => {
  await apiClient.delete(`/grades/${id}`);
};

export const getMyGrades = async (): Promise<StudentGrades> => {
  const response = await apiClient.get("/grades/me", CACHE_PROFILES.DYNAMIC);
  return response.data;
};

export const getChildGrades = async (
  studentId: number,
): Promise<StudentGrades> => {
  const response = await apiClient.get(
    `/parent/children/${studentId}/grades`,
    CACHE_PROFILES.DYNAMIC,
  );
  return response.data;
};

// ==================== HOMEWORK (Phase 4) ====================

export const listHomework = async (params?: {
  classId?: string;
  subjectId?: string;
}): Promise<HomeworkView[]> => {
  const response = await apiClient.get("/homework", {
    params,
    ...CACHE_PROFILES.DYNAMIC,
  });
  return response.data;
};

export const createHomework = async (
  dto: CreateHomeworkInput,
): Promise<HomeworkView> => {
  const response = await apiClient.post("/homework", dto);
  return response.data;
};

export const deleteHomework = async (id: string): Promise<void> => {
  await apiClient.delete(`/homework/${id}`);
};

export const getMyHomework = async (): Promise<MyHomework> => {
  const response = await apiClient.get("/me/homework", CACHE_PROFILES.DYNAMIC);
  return response.data;
};

export const getChildHomework = async (
  studentId: number,
): Promise<ChildHomeworkRow[]> => {
  const response = await apiClient.get(
    `/parent/children/${studentId}/homework`,
    CACHE_PROFILES.DYNAMIC,
  );
  return response.data;
};
