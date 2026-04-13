# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Education Platform Frontend - A React TypeScript application for language learning and education. Features interactive courses, lessons, vocabulary learning with spaced repetition, exercises, progress tracking, and gamification with streaks and XP.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Architecture

### Tech Stack
- **React 19** with TypeScript
- **Vite 7** for build tooling
- **Tailwind CSS 4** for styling
- **TanStack Query** for server state management
- **Zustand** for client state (auth store)
- **React Router DOM** for routing
- **Axios** for API calls with token refresh interceptor
- **React Hot Toast** for notifications

### Path Alias
`@/` maps to `./src/` (configured in vite.config.ts)

### Directory Structure

```
src/
├── api/           # API layer - one file per domain (client.ts has axios config)
│   ├── client.ts              # Axios client with interceptors
│   ├── auth.api.ts            # Authentication endpoints
│   └── education.api.ts       # Education platform endpoints
├── components/    # Reusable components organized by category
│   ├── auth/      # ProtectedRoute
│   ├── effects/   # NeonBackground, animations
│   ├── layout/    # Layout wrapper
│   └── ui/        # Button, Card, Badge, Input, SearchBar
├── config/        # App configuration (query.ts has React Query setup + QUERY_KEYS)
│   ├── query.ts               # React Query config and keys
│   ├── routes.ts              # Routes configuration
│   └── index.ts               # Config exports
├── hooks/         # Custom hooks (useAuth, useResponsive)
├── pages/         # Route components
│   ├── LandingPage.tsx        # Home page
│   ├── Login.tsx              # Login page
│   ├── Register.tsx           # Register page
│   ├── GoogleCallback.tsx     # Google OAuth callback
│   ├── Education.tsx          # Education platform home
│   ├── CourseDetail.tsx       # Course detail page
│   └── LessonView.tsx         # Lesson viewer page
├── store/         # Zustand stores (auth.store.ts)
├── styles/        # CSS files (animations.css)
├── types/         # TypeScript types organized by domain
│   ├── common.types.ts        # Shared types
│   ├── education.types.ts     # Education platform types
│   └── api/                   # API types
└── utils/         # Utility functions (formatters, validators, constants)
```

### Key Patterns

**API Layer**: Each domain has its own API file that uses the shared `apiClient` from `client.ts`. The client handles JWT token attachment and automatic refresh on 401 responses.

**State Management**:
- Server state: TanStack Query with centralized `QUERY_KEYS` in `config/query.ts`
- Auth state: Zustand with localStorage persistence (`auth.store.ts`)

**Authentication**: `useAuth` hook wraps the Zustand store. `ProtectedRoute` component guards authenticated routes.

**Styling**: Dark cyberpunk theme with neon colors. CSS variables defined in `index.css`. Use existing glass-card, btn-primary, stat-card classes. Tailwind for layout and spacing.

### Environment Variables
- `VITE_API_URL` - Backend API base URL (defaults to http://localhost:3000)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)

### Backend Integration
The frontend expects a NestJS backend at the API URL with endpoints for:
- `/auth/*` - Authentication (login, register, refresh, Google OAuth)
- `/education/*` - Courses, lessons, vocabulary, exercises, progress, streaks

## API Layer Architecture

### Client Configuration (`src/api/client.ts`)
The `apiClient` is configured with two interceptors:
1. **Request interceptor**: Automatically attaches JWT tokens from Zustand store or localStorage
2. **Response interceptor**: Handles 401 errors by attempting token refresh, then retrying the original request

### Education Platform API (`src/api/education.api.ts`)

#### Public Endpoints
- `getLanguages()` - Get all available languages
- `getCourses(params)` - Get courses with optional filtering (languageId, level, pagination)
- `getCourseById(id)` - Get course details
- `getLanguageById(id)` - Get language details

#### Protected Endpoints
- `enrollCourse(courseId)` - Enroll in a course
- `getMyCourses()` - Get user's enrolled courses
- `getLessonsByCourse(courseId)` - Get all lessons in a course
- `getLessonById(id)` - Get lesson details
- `completeLesson(lessonId, data)` - Mark lesson as complete with time spent and exercise score
- `getVocabularyByLesson(lessonId)` - Get vocabulary for a lesson
- `getVocabularyToReview(limit)` - Get vocabulary due for review (spaced repetition)
- `reviewVocabulary(vocabularyId, quality)` - Submit vocabulary review with quality rating
- `getExercisesByLesson(lessonId)` - Get exercises for a lesson
- `submitExercises(lessonId, answers)` - Submit exercise answers
- `getUserProgress()` - Get overall user progress
- `getUserStreak()` - Get user streak information

## State Management

### TanStack Query Configuration (`src/config/query.ts`)
- Pre-configured `queryClient` with sensible defaults
- Centralized `QUERY_KEYS` object for cache management
- 5-minute stale time, 10-minute garbage collection time
- Automatic retry on failure (1 attempt)

### Zustand Store (`src/store/auth.store.ts`)
Authentication state management with:
- `accessToken`, `refreshToken`, `user` state
- `isAuthenticated`, `isLoading`, `error` flags
- `login`, `logout`, `register`, `setTokens`, `setUser` actions
- localStorage persistence for backup

### useAuth Hook (`src/hooks/useAuth.ts`)
Convenience wrapper around the auth store that exports all state and actions.

## Type System

### Type Organization
Types are organized by domain in `src/types/`:
- `common.types.ts` - Shared types (ApiResponse, PaginatedResponse, ErrorResponse)
- `education.types.ts` - Education platform types

### Education Types (`src/types/education.types.ts`)

#### Core Types
- `Language` - Language information (id, code, name, flag, etc.)
- `Course` - Course details with level, duration, pricing
- `Lesson` - Lesson content with type, duration, order
- `Vocabulary` - Vocabulary items with pronunciation, examples, difficulty
- `Exercise` - Exercise questions with type, options, points

#### Enums
- `CourseLevel` - BEGINNER, ELEMENTARY, INTERMEDIATE, UPPER_INTERMEDIATE, ADVANCED
- `LessonType` - VOCABULARY, GRAMMAR, READING, LISTENING, SPEAKING, PRACTICE, QUIZ
- `ExerciseType` - MULTIPLE_CHOICE, FILL_BLANK, MATCHING, TRANSLATION, LISTENING, SPEAKING, ORDERING, TRUE_FALSE
- `EnrollmentStatus` - ENROLLED, IN_PROGRESS, COMPLETED, PAUSED

#### User Progress Types
- `UserCourse` - User's enrollment in a course with progress tracking
- `UserStreak` - Streak information (current, longest, total days, XP, level)
- `UserProgress` - Overall progress summary
- `ExerciseResult` - Result of a single exercise
- `SubmitExercisesResult` - Complete exercise submission results

#### API Response Types
- `CoursesResponse` - Paginated courses response

## Utility Functions

### Formatters (`src/utils/formatters.ts`)
- `formatCurrency()` - Format as VND
- `formatNumber()` - Format with separators
- `formatPercent()` - Format percentage
- `formatCompactNumber()` - Format with K, M, B
- `formatDate()` - Format dates
- `formatRelativeTime()` - Relative time (e.g., "2 hours ago")

### Validators (`src/utils/validators.ts`)
- `isValidEmail()` - Email validation
- `isValidPassword()` - Password strength
- `isValidStockSymbol()` - Stock symbol format
- `isPositiveNumber()` - Number validation
- `isInRange()` - Range validation

### Constants (`src/utils/constants.ts`)
- `API_CONFIG` - API timeout and retry settings
- `PAGINATION` - Page size options
- `COLORS` - Color scheme constants
- `STORAGE_KEYS` - LocalStorage key names

## Custom Hooks

### useAuth (`src/hooks/useAuth.ts`)
Wraps the auth store for convenient access to authentication state and actions.

### useResponsive (`src/hooks/useResponsive.ts`)
Provides responsive design utilities.

## Routing Configuration

### Routes (`src/config/routes.ts`)
Centralized route definitions with:
- `ROUTES` object with all route paths
- `ROUTE_TITLES` object with route titles
- Dynamic route functions

### Current Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Register page
- `/auth/callback` - Google OAuth callback
- `/education` - Education platform home
- `/education/courses/:id` - Course detail page
- `/education/lessons/:id` - Lesson viewer (protected)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Key Components

### API Layer (`src/api/`)
- `client.ts` - Configures axios with interceptors for auth token management
- `auth.api.ts` - Authentication endpoints
- `education.api.ts` - Education platform endpoints

### State Management
- **Zustand**: Authentication state stored in `auth.store.ts` with localStorage persistence
- **TanStack Query**: Server state management with automatic caching and refetching

### UI Components
- **Layout**: Modern fintech app design with glassmorphism effects
- **Animations**: Cyberpunk-inspired animations (glitch effects, neon glow, floating animations)

### Styling System
- **Design System**: Custom CSS variables for colors, typography, and effects
- **Animations**: Extensive animation library in `animations.css`
- **Responsive**: Mobile-first design with appropriate fallbacks

### Education Platform Features
The education section features:
- Interactive course catalog with filtering by language and level
- Lesson viewing with progress tracking
- Vocabulary learning with spaced repetition system
- Interactive exercises with multiple types (multiple choice, fill blank, matching, etc.)
- User progress tracking with streaks and XP
- Gamification with levels and achievements
- Animated transitions and glass morphism UI
- Dark theme with violet/amber accent colors

## Authentication Flow

1. User logs in via `/auth/login` or Google OAuth
2. Tokens stored in Zustand store and localStorage (backup)
3. `apiClient` automatically attaches tokens to requests
4. On 401 error, automatic token refresh attempted
5. If refresh fails, user logged out and redirected to login

## Performance Considerations

- TanStack Query caching reduces API calls
- Code splitting ready for optimization
- Lazy loading for large components
- Optimistic updates for better UX
