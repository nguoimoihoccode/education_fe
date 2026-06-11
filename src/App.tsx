import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { queryClient } from '@/config';
import type { User } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { shouldEnableQuizOfflineAuth } from '@/store/quizOfflineAuth';
import { useSettingsStore } from '@/store/settings.store';
import { useEffect, lazy, Suspense } from 'react';

// ============================================
// Lazy-loaded route components
// Mỗi page sẽ được tách thành chunk riêng,
// chỉ tải khi user navigate đến route đó
// ============================================

// Auth pages (nhỏ, load nhanh)
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })));
const GoogleCallback = lazy(() => import('@/pages/GoogleCallback').then(m => ({ default: m.GoogleCallback })));

// Landing pages
const LandingPageNew = lazy(() => import('@/pages/landing/LandingPageNew'));
const DashboardLanding = lazy(() => import('@/pages/DashboardLanding'));

// Education core
const Education = lazy(() => import('@/pages/Education'));
const Today = lazy(() => import('@/pages/Today'));
const LearningCoach = lazy(() => import('@/pages/LearningCoach'));
const CourseDetail = lazy(() => import('@/pages/CourseDetail'));
const LessonView = lazy(() => import('@/pages/LessonView'));
const Slides = lazy(() => import('@/pages/Slides'));
const SlideCreate = lazy(() => import('@/pages/SlideCreate'));
const SlideEdit = lazy(() => import('@/pages/SlideEdit'));
const SlidePresent = lazy(() => import('@/pages/SlidePresent'));
const SlideDemo = lazy(() => import('@/pages/SlideDemo'));

// Flashcards
const FlashcardDecks = lazy(() => import('@/pages/FlashcardDecks'));
const FlashcardReview = lazy(() => import('@/pages/FlashcardReview'));
const FlashcardStatsPage = lazy(() => import('@/pages/FlashcardStatsPage'));
const DocumentImportPage = lazy(() => import('@/pages/DocumentImport'));

// Quiz
const QuizListPage = lazy(() => import('@/pages/quiz/QuizListPage'));
const QuizDetailPage = lazy(() => import('@/pages/quiz/QuizDetailPage'));
const QuizSessionPage = lazy(() => import('@/pages/quiz/QuizSessionPage'));
const QuizResultPage = lazy(() => import('@/pages/quiz/QuizResultPage'));
const QuizStatsPage = lazy(() => import('@/pages/quiz/QuizStatsPage'));

// Social & Community
const UserProfile = lazy(() => import('@/pages/UserProfile'));
const AiTutor = lazy(() => import('@/pages/AiTutor'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));
const Social = lazy(() => import('@/pages/Social'));
const CommunityHub = lazy(() => import('@/pages/CommunityHub'));
const ScholarProfile = lazy(() => import('@/pages/ScholarProfile'));

// Settings & Misc
const PremiumUpgrade = lazy(() => import('@/pages/PremiumUpgrade'));
const AdvancedSettings = lazy(() => import('@/pages/AdvancedSettings'));
const SessionManagement = lazy(() => import('@/pages/SessionManagement'));
const AdminSessions = lazy(() => import('@/pages/AdminSessions'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const DataExportLogs = lazy(() => import('@/pages/DataExportLogs'));
const ComingSoon = lazy(() => import('@/pages/ComingSoon'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// ============================================
// Loading Fallback
// ============================================
function PageLoader() {
  return (
    <div className="min-h-[72vh] px-4 py-8 sm:px-6" role="status" aria-live="polite">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-violet-500 shadow-lg shadow-emerald-500/20" />
          <div className="min-w-0 flex-1">
            <div className="h-4 w-28 rounded-full bg-white/20" />
            <div className="mt-3 h-3 w-44 max-w-full rounded-full bg-white/10" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-28 rounded-3xl bg-white/[0.07]" />
          <div className="h-28 rounded-3xl bg-white/[0.07]" />
          <div className="h-28 rounded-3xl bg-white/[0.07]" />
        </div>
        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="h-3 w-5/6 rounded-full bg-white/10" />
          <div className="h-3 w-3/5 rounded-full bg-white/10" />
          <div className="h-3 w-4/5 rounded-full bg-white/10" />
        </div>
        <span className="sr-only">Đang tải nội dung...</span>
      </div>
    </div>
  );
}

// ============================================
// Settings Effect (theme, accent, font size)
// ============================================
function SettingsEffect() {
  const { theme, accentColor, fontSize, reducedMotion, compactMode, highContrast } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;

    // Handle Theme
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }

    // Handle High Contrast
    if (highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    // Handle Font Size
    root.setAttribute('data-font-size', fontSize);

    // Handle Reduced Motion
    if (reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }

    // Handle Compact Mode
    if (compactMode) {
      root.setAttribute('data-compact', 'true');
    } else {
      root.removeAttribute('data-compact');
    }

    // Handle Accent Color Mapping (Tailwind RGB format)
    const palettes: Record<string, Record<string, string>> = {
      violet: {
        '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253',
        '400': '167 139 250', '500': '139 92 246', '600': '124 58 237', '700': '109 40 217',
        '800': '91 33 182', '900': '76 29 149', '950': '46 16 101'
      },
      emerald: {
        '50': '236 253 245', '100': '209 250 229', '200': '167 243 208', '300': '110 231 183',
        '400': '52 211 153', '500': '16 185 129', '600': '5 150 105', '700': '4 120 87',
        '800': '6 95 70', '900': '6 78 59', '950': '2 44 34'
      },
      amber: {
        '50': '255 251 235', '100': '254 243 199', '200': '253 230 138', '300': '252 211 77',
        '400': '251 191 36', '500': '245 158 11', '600': '217 119 6', '700': '180 83 9',
        '800': '146 64 14', '900': '120 53 15', '950': '69 26 3'
      },
      fuchsia: {
        '50': '253 244 255', '100': '250 232 255', '200': '245 208 254', '300': '240 171 252',
        '400': '232 121 249', '500': '217 70 239', '600': '192 38 211', '700': '162 28 175',
        '800': '134 25 143', '900': '112 26 117', '950': '74 4 78'
      },
      rose: {
        '50': '255 241 242', '100': '255 228 230', '200': '254 205 211', '300': '253 164 175',
        '400': '251 113 133', '500': '244 63 94', '600': '225 29 72', '700': '190 18 60',
        '800': '159 18 57', '900': '136 19 55', '950': '76 5 25'
      },
      blue: {
        '50': '239 246 255', '100': '219 234 254', '200': '191 219 254', '300': '147 197 253',
        '400': '96 165 250', '500': '59 130 246', '600': '37 99 235', '700': '29 78 216',
        '800': '30 64 175', '900': '30 58 138', '950': '23 37 84'
      }
    };

    const activePalette = palettes[accentColor] || palettes.violet;
    Object.entries(activePalette).forEach(([shade, rgbString]) => {
      root.style.setProperty(`--color-accent-${shade}`, rgbString);
    });
  }, [theme, accentColor, fontSize, reducedMotion, compactMode, highContrast]);

  return null;
}

function QuizOfflineAuthBootstrap() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    const enabled = import.meta.env.VITE_QUIZ_OFFLINE_MODE === 'true';

    if (shouldEnableQuizOfflineAuth(enabled, isAuthenticated)) {
      const mockUser: User = {
        id: 'offline-user',
        email: 'offline@quiz.local',
        displayName: 'Offline Learner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTokens('offline-access-token', 'offline-refresh-token', mockUser);
    }
  }, [isAuthenticated, setTokens]);

  return null;
}

// ============================================
// App Component
// ============================================
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsEffect />
      <QuizOfflineAuthBootstrap />
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ComingSoon />} />
              <Route path="/auth/callback" element={<GoogleCallback />} />
              <Route
                path="/today"
                element={
                  <ProtectedRoute>
                    <Today />
                  </ProtectedRoute>
                }
              />
              <Route path="/education" element={<Education />} />
              <Route
                path="/learning-coach"
                element={
                  <ProtectedRoute>
                    <LearningCoach />
                  </ProtectedRoute>
                }
              />
              <Route path="/education/courses/:id" element={<CourseDetail />} />
              <Route
                path="/education/lessons/:id"
                element={
                  <ProtectedRoute>
                    <LessonView />
                  </ProtectedRoute>
                }
              />
              <Route path="/education/slides" element={<ProtectedRoute><Slides /></ProtectedRoute>} />
              <Route path="/education/slides/create" element={<ProtectedRoute><SlideCreate /></ProtectedRoute>} />
              <Route path="/education/slides/demo" element={<ProtectedRoute><SlideDemo /></ProtectedRoute>} />
              <Route path="/education/slides/:id/edit" element={<ProtectedRoute><SlideEdit /></ProtectedRoute>} />
              <Route path="/education/slides/:id/present" element={<ProtectedRoute><SlidePresent /></ProtectedRoute>} />
              <Route
                path="/flashcards"
                element={
                  <ProtectedRoute>
                    <FlashcardDecks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/decks"
                element={
                  <ProtectedRoute>
                    <FlashcardDecks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/review"
                element={
                  <ProtectedRoute>
                    <FlashcardReview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/stats"
                element={
                  <ProtectedRoute>
                    <FlashcardStatsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/document-import"
                element={
                  <ProtectedRoute>
                    <DocumentImportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz"
                element={
                  <ProtectedRoute>
                    <QuizListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/stats"
                element={
                  <ProtectedRoute>
                    <QuizStatsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/history"
                element={
                  <ProtectedRoute>
                    <QuizStatsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId/session"
                element={
                  <ProtectedRoute>
                    <QuizSessionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/session/:sessionId/result"
                element={
                  <ProtectedRoute>
                    <QuizResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:id"
                element={
                  <ProtectedRoute>
                    <QuizDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-tutor"
                element={
                  <ProtectedRoute>
                    <AiTutor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social"
                element={
                  <ProtectedRoute>
                    <Social />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/premium"
                element={
                  <ProtectedRoute>
                    <PremiumUpgrade />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <CommunityHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AdvancedSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/sessions"
                element={
                  <ProtectedRoute>
                    <SessionManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/sessions"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminSessions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/data-logs"
                element={
                  <ProtectedRoute>
                    <DataExportLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scholar/:username"
                element={<ScholarProfile />}
              />
              <Route
                path="/coming-soon"
                element={<ComingSoon />}
              />
              <Route path="/dashboard-landing" element={<DashboardLanding />} />
              <Route path="/unauthorized" element={<ComingSoon />} />
              <Route path="/" element={<LandingPageNew />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
