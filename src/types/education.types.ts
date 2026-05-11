// Education Types

export interface Language {
    id: string;
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    active: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export enum CourseLevel {
    BEGINNER = 'beginner',
    ELEMENTARY = 'elementary',
    INTERMEDIATE = 'intermediate',
    UPPER_INTERMEDIATE = 'upper_intermediate',
    ADVANCED = 'advanced',
}

export interface Course {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    thumbnail: string | null;
    level: CourseLevel;
    estimatedHours: number;
    totalLessons: number;
    free: boolean;
    price: number;
    active: boolean;
    featured?: boolean;
    category?: string;
    order: number;
    language: Language;
    languageId: string;
    lessons?: Lesson[];
    createdAt: string;
    updatedAt: string;
}

export type TodayPlanTaskType =
    | 'continue_lesson'
    | 'review_flashcards'
    | 'quick_quiz'
    | 'fix_mistakes';

export interface TodayPlanTask {
    id: string;
    type: TodayPlanTaskType;
    title: string;
    description: string;
    ctaLabel: string;
    targetUrl: string;
    estimatedMinutes: number;
    completed: boolean;
    priority: number;
}

export interface TodayPlan {
    date: string;
    completedTasks: number;
    totalTasks: number;
    estimatedMinutes: number;
    streak: {
        current: number;
        longest: number;
    };
    tasks: TodayPlanTask[];
}

export enum LessonType {
    VOCABULARY = 'vocabulary',
    GRAMMAR = 'grammar',
    READING = 'reading',
    LISTENING = 'listening',
    SPEAKING = 'speaking',
    PRACTICE = 'practice',
    QUIZ = 'quiz',
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    content: string | null;
    type: LessonType;
    estimatedMinutes: number;
    orderIndex: number;
    active: boolean;
    videoUrl: string | null;
    audioUrl: string | null;
    courseId: string;
    vocabularies?: Vocabulary[];
    exercises?: Exercise[];
    createdAt: string;
    updatedAt: string;
}

export interface Vocabulary {
    id: string;
    word: string;
    meaning: string;
    pronunciation: string | null;
    audioUrl: string | null;
    imageUrl: string | null;
    example: string | null;
    exampleTranslation: string | null;
    notes: string | null;
    partOfSpeech: string | null;
    difficulty: number;
    orderIndex: number;
    lessonId: string;
    createdAt: string;
    updatedAt: string;
}

export enum ExerciseType {
    MULTIPLE_CHOICE = 'multiple_choice',
    FILL_BLANK = 'fill_blank',
    MATCHING = 'matching',
    TRANSLATION = 'translation',
    LISTENING = 'listening',
    SPEAKING = 'speaking',
    ORDERING = 'ordering',
    TRUE_FALSE = 'true_false',
}

export interface Exercise {
    id: string;
    type: ExerciseType;
    question: string;
    options: string[] | null;
    answer: unknown;
    explanation: string | null;
    audioUrl: string | null;
    imageUrl: string | null;
    points: number;
    difficulty: number;
    orderIndex: number;
    lessonId: string;
    createdAt: string;
    updatedAt: string;
}

export enum EnrollmentStatus {
    ENROLLED = 'enrolled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    PAUSED = 'paused',
}

export interface UserCourse {
    id: string;
    userId: string;
    courseId: string;
    course: Course;
    status: EnrollmentStatus;
    progress: number;
    completedLessons: number;
    enrolledAt: string;
    completedAt: string | null;
    totalTimeSpent: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserStreak {
    id: string;
    userId: string;
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    lastActivityDate: string | null;
    totalXp: number;
    level: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserProgress {
    streak: UserStreak;
    enrolledCourses: number;
    completedCourses: number;
    completedLessons: number;
    learnedVocabularies: number;
    masteredVocabularies: number;
}

export interface LearningPlanAction {
    type: 'lesson' | 'flashcard_review' | 'quiz_retry';
    title: string;
    reason: string;
    priority: number;
    route: string;
}

export interface LearningPlan {
    dailyGoal: {
        targetMinutes: number;
        completedMinutes: number;
        targetReviews: number;
        completedReviews: number;
    };
    nextLesson: {
        id: string;
        title: string;
        courseTitle: string;
        estimatedMinutes: number;
        route: string;
    } | null;
    dueReviews: {
        count: number;
        recommendedLimit: number;
    };
    weakQuizzes: Array<{
        quizId: string;
        title: string;
        topic: string;
        score: number;
        recommendation: string;
        route: string;
    }>;
    streak: {
        current: number;
        longest: number;
        xp: number;
        level: number;
    };
    recommendedActions: LearningPlanAction[];
}

export interface ExerciseResult {
    exerciseId: string;
    correct: boolean;
    userAnswer: unknown;
    correctAnswer: unknown;
    explanation: string | null;
    pointsEarned: number;
}

export interface SubmitExercisesResult {
    totalExercises: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    totalPoints: number;
    earnedPoints: number;
    results: ExerciseResult[];
}

// API Response types
export interface CoursesResponse {
    items: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface LessonsResponse {
    items: Lesson[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface VocabularyResponse {
    items: Vocabulary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
