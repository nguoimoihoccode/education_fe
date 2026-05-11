import { apiClient, CACHE_PROFILES } from './client';
import { normalizeCollectionPage } from './normalizers';
import type {
    Language,
    Course,
    Lesson,
    Vocabulary,
    Exercise,
    UserCourse,
    UserStreak,
    UserProgress,
    LearningPlan,
    CoursesResponse,
    LessonsResponse,
    SubmitExercisesResult,
} from '@/types/education.types';

// ==================== PUBLIC ENDPOINTS ====================

export const getLanguages = async (): Promise<Language[]> => {
    const response = await apiClient.get('/education/languages', CACHE_PROFILES.STATIC);
    return response.data;
};

export const getCourses = async (params?: {
    languageId?: string;
    level?: string;
    page?: number;
    limit?: number;
}): Promise<CoursesResponse> => {
    const response = await apiClient.get('/education/courses', { params, ...CACHE_PROFILES.DYNAMIC });
    return normalizeCollectionPage<Course>(response.data, 'courses');
};

export const getCourseById = async (id: string): Promise<Course> => {
    const response = await apiClient.get(`/education/courses/${id}`, CACHE_PROFILES.DYNAMIC);
    return response.data;
};

export const getLanguageById = async (id: string): Promise<Language> => {
    const response = await apiClient.get(`/education/languages/${id}`, CACHE_PROFILES.STATIC);
    return response.data;
};

// ==================== PROTECTED ENDPOINTS ====================

export const enrollCourse = async (courseId: string): Promise<UserCourse> => {
    const response = await apiClient.post(`/education/courses/${courseId}/enroll`);
    return response.data;
};

export const getMyCourses = async (): Promise<UserCourse[]> => {
    const response = await apiClient.get('/education/my-courses', CACHE_PROFILES.USER);
    return response.data;
};

export const getLessonsByCourse = async (courseId: string, params?: {
    page?: number;
    limit?: number;
}): Promise<LessonsResponse> => {
    const response = await apiClient.get(`/education/courses/${courseId}/lessons`, { params, ...CACHE_PROFILES.DYNAMIC });
    return normalizeCollectionPage<Lesson>(response.data, 'lessons');
};

export const getLessonById = async (id: string): Promise<Lesson> => {
    const response = await apiClient.get(`/education/lessons/${id}`, CACHE_PROFILES.DYNAMIC);
    return response.data;
};

export const completeLesson = async (
    lessonId: string,
    data: { timeSpent?: number; exerciseScore?: number }
): Promise<void> => {
    await apiClient.post(`/education/lessons/${lessonId}/complete`, data);
};

export const getVocabularyByLesson = async (lessonId: string): Promise<Vocabulary[]> => {
    const response = await apiClient.get(`/education/lessons/${lessonId}/vocabulary`, CACHE_PROFILES.DYNAMIC);
    return Array.isArray(response.data?.vocabulary)
        ? response.data.vocabulary
        : Array.isArray(response.data)
            ? response.data
            : [];
};

export const getVocabularyToReview = async (limit?: number): Promise<Vocabulary[]> => {
    const response = await apiClient.get('/education/vocabulary/review', {
        ...CACHE_PROFILES.NO_CACHE,
        params: { limit },
    });
    return response.data;
};

export const reviewVocabulary = async (
    vocabularyId: string,
    quality: number
): Promise<void> => {
    await apiClient.post(`/education/vocabulary/${vocabularyId}/review`, { quality });
};

export const getExercisesByLesson = async (lessonId: string): Promise<Exercise[]> => {
    const response = await apiClient.get(`/education/lessons/${lessonId}/exercises`, CACHE_PROFILES.DYNAMIC);
    return response.data;
};

export const submitExercises = async (
    lessonId: string,
    answers: { exerciseId: string; answer: unknown }[]
): Promise<SubmitExercisesResult> => {
    const response = await apiClient.post(
        `/education/lessons/${lessonId}/exercises/submit`,
        { answers }
    );
    return response.data;
};

export const getUserProgress = async (): Promise<UserProgress> => {
    const response = await apiClient.get('/education/progress', CACHE_PROFILES.USER);
    return response.data;
};

export const getUserStreak = async (): Promise<UserStreak> => {
    const response = await apiClient.get('/education/streak', CACHE_PROFILES.DYNAMIC);
    return response.data;
};

export const getLearningPlan = async (): Promise<LearningPlan> => {
    const response = await apiClient.get('/education/learning-plan', CACHE_PROFILES.USER);
    return response.data;
};
