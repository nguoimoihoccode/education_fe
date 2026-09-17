# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React frontend for a **language-learning education platform** (Vietnamese product), backed by the NestJS API in `../education_be` (`VITE_API_URL`, default `http://localhost:3000`, no URL prefix). Features: course catalog & lessons, flashcards with spaced repetition, quizzes (incl. AI-generated), AI Tutor chat (server-side or BYOK), document→content import, daily learning plan / coach, streaks/XP/leaderboard, session management, PWA.

## Commands

```bash
npm run dev              # Vite dev server (http://localhost:5173)
npm run build            # tsc -b && vite build
npm run lint             # eslint .
npm run test             # vitest (watch)
npm run test:run         # vitest run
npm run test:contracts   # node --test tests/*.test.ts (contract tests, no jsdom)
npm run ci               # lint + test:run + test:contracts + build
npm run preview          # preview production build
```

## Tech Stack

- **React 19** + TypeScript, **Vite 7**, **React Router 7**
- **Tailwind CSS 3** + custom CSS design tokens
- **TanStack Query 5** (server state) + **Zustand 5** (client state)
- **Axios** + `axios-cache-interceptor` (HTTP + client-side caching)
- Charts: `recharts`, `@nivo/heatmap` (streak heatmap), `d3`; animation: `framer-motion`, `animejs`; icons: `lucide-react`; `react-markdown` (lesson/AI content), `react-hot-toast`
- **PWA** via `vite-plugin-pwa` (`registerType: 'autoUpdate'`, workbox precache, CacheFirst for fonts/images; API responses are cached by axios/TanStack Query instead)
- Path alias: `@/` → `./src/`

## Directory Structure

```
src/
├── api/          # One file per domain: auth, education, flashcard, quiz, ai, aiDirect, document, school
│                 # + client.ts (axios instance), normalizers.ts (API response → view models),
│                 # + path helpers (documentImportPaths, quizSessionQuestionsPath…), session-cleanup.ts
├── components/   # ai/ auth/ document/ flashcard/ layout/ (Layout, Sidebar, Header) quiz/ school/ (TimetableGrid, MyTimetablePanel, StudentGradesPanel, timetable-meta, attendance-status, grades-meta) ui/ effects/
├── config/       # routes.ts (ROUTES + ROUTE_TITLES), query.ts (queryClient + central QUERY_KEYS), index.ts
├── hooks/        # useAuth, useResponsive, useRateLimit
├── pages/        # Route components, lazy-loaded from App.tsx; subdirs: landing/ premium/ quiz/ user-profile/ principal/ teacher/ parent/ student/
├── store/        # auth.store.ts, settings.store.ts, aiProvider.store.ts (BYOK config), quizOfflineAuth.ts
├── styles/       # animations.css
├── test/         # vitest setup.ts (jsdom)
├── types/        # common.types.ts, education.types.ts, api/, models/
└── utils/        # formatters, validators, constants (STORAGE_KEYS, PAGINATION, COLORS)
```

`__tests__/` at repo root is an empty placeholder tree (.gitkeep) — **do not** add tests there; colocate in `src/`.

## Routing (`src/App.tsx` + `src/config/routes.ts`)

All pages are `React.lazy` + `Suspense`; everything sits in a shared `Layout` (Sidebar/Header). `ProtectedRoute` (from `components/auth`) guards authenticated routes; `/admin/sessions` is admin-only. Main routes:

| Route | Page | Notes |
|---|---|---|
| `/` | landing (`pages/landing/LandingPageNew`, `LandingPage`) | marketing |
| `/login` `/register` `/auth/callback` | auth pages | Google OAuth callback |
| `/forgot-password` | `ComingSoon` | **not implemented** |
| `/education`, `/education/courses/:id`, `/education/lessons/:id` | catalog → course → lesson | lesson protected |
| `/today` | Today | daily learning hub (from `education/today-plan`) |
| `/learning-coach` | LearningCoach | AI coach summary (Vietnamese) |
| `/flashcards`, `/flashcards/decks|review|stats`, `/flashcards/document-import` | flashcard suite | SRS review |
| `/quiz`, `/quiz/stats`, `/quiz/history`, `/quiz/:id`, `/quiz/:id/session`, `/quiz/session/:id/result` | quiz suite (`pages/quiz/`) | incl. AI-generated quizzes |
| `/ai-tutor` | AiTutor | server chat or BYOK |
| `/profile`, `/scholar/:username` | UserProfile, ScholarProfile | public scholar profile |
| `/premium` | PremiumUpgrade | **UI only — billing disabled** |
| `/settings`, `/settings/sessions`, `/admin/sessions` | AdvancedSettings, SessionManagement, AdminSessions | |
| `/data-logs` | DataExportLogs | exports + activity logs |
| `/principal`, `/principal/classes`, `/principal/subjects`, `/principal/teachers` | `pages/principal/` | school admin (Phase 1 of `docs/SCHOOL_PLATFORM_PLAN.md`); routes use `<ProtectedRoute roles={['principal','admin']}>`, sidebar section "Quản trị trường" is role-gated via `NavItem.roles` |
| `/teaching`, `/teaching/classes/:id` | `pages/teacher/` | GVCN hub (Phase 2): homeroom classes, roster, parent invites (generate code / approve / revoke); plain `<ProtectedRoute>` (reads are open; writes stay server-gated), sidebar "Lớp của tôi". Class detail links to `/teaching/classes/:id/attendance` (Phase 3) and the Phase 4 pages below |
| `/principal/timetable` | `pages/principal/TimetablePage` | Timetable builder (Phase 3): class picker, click empty cell → add slot (subject+teacher come from the class's teaching assignments), period-config editor; `roles={['principal','admin']}` |
| `/teaching/timetable`, `/me/school` | `pages/teacher/MyTimetablePage`, `pages/student/MySchoolPage` | Read-only weekly grid from `GET /timetable/me` (`components/school/MyTimetablePanel`); open to any signed-in user, no `roles`. `MySchoolPage` (Phase 4) has tabs **Thời khoá biểu | Điểm | BTVN** — `GET /grades/me` (via shared `StudentGradesPanel`) + `GET /me/homework` with "Làm bài" CTA to `/quiz/:targetId`, overdue badges, "Đã làm" tick from the auto-grade join, pending-count badge on the tab |
| `/teaching/classes/:id/grades` | `pages/teacher/GradebookPage` | Sổ điểm (Phase 4): subject picker = principal/admin all subjects vs teacher own assignments for the class, term picker (Cả năm/HK I/HK II), grid HS × loại điểm (miệng/15p/45p/cuối kỳ) with click-to-add/edit/delete grade modal (coefficient auto-hint from `components/school/grades-meta` DEFAULT_COEFFICIENT), TB giữa kỳ / cả năm tính server-side (`GET /grades/report`); bên dưới là panel **Xếp hạng** (`GET /grades/ranking`, toggle *Theo môn | Toàn lớp*, 🥇🥈🥉, đồng hạng kiểu 1-1-3, reuse đúng subject/term đang chọn; hạng toàn lớp chỉ GVCN/HQ/admin xem được — BE 404, FE hiện hint); plain `<ProtectedRoute>` (reads are open; writes stay server-gated), linked from class detail |
| `/teaching/classes/:id/homework` | `pages/teacher/HomeworkPage` | Giao BTVN (Phase 4): `POST /homework` picking an existing Learning Hub quiz/deck (`getQuizzes`/`getFlashcardDecks` `{items}`), datetime-local deadline → ISO, "Đầu điểm 15p" checkbox (quiz only — completing the quiz auto-creates a grade), list + delete ("thu hồi") for the class; plain `<ProtectedRoute>` (reads are open; writes stay server-gated) |
| `/teaching/classes/:id/attendance` | `pages/teacher/ClassAttendancePage` | Quick attendance sheet (Phase 3): date + period → per-student Có mặt/Trễ/Vắng/Có phép + note + save, 30-day history |
| `/parent`, `/parent/children/:studentId` | `pages/parent/` | parent portal (Phase 2): claim invite code + children list (pending/approved); child page has 5 tabs **Hồ sơ / Thời khoá biểu / Điểm danh / Điểm / BTVN** (Phase 3–4 reads via `/parent/children/:id/{timetable,attendance,grades,homework}`, approved links only — grades render through `StudentGradesPanel`, which now also shows a per-subject "🏅 Hạng X/N" chip (`rank`/`rankedCount` come from BE per subject×term, competition ranking with ties); homework is read-only; error copies the "chưa duyệt liên kết" pattern when the link is still pending); plain `ProtectedRoute` on purpose — a fresh parent account has no `parent` role until the claim succeeds, and sidebar "Con của tôi" carries no `roles` either (the page itself shows the "chưa có liên kết" notice) |
| `/onboarding`, `/dashboard-landing`, `/coming-soon`, `/unauthorized` | misc | |

## State Management

- **Server state**: TanStack Query — one `useQuery` per endpoint group, cache keys centralized in `QUERY_KEYS` (`config/query.ts`), 5 min staleTime. Invalidate via QUERY_KEYS after mutations.
- **Auth**: Zustand `auth.store.ts` (tokens + user, localStorage-persisted backup); `useAuth` hook wraps it.
- **AI BYOK**: `aiProvider.store.ts` persists user's own `apiKey/baseUrl/model/maxTokens/temperature` (defaults to Groq `llama-3.3-70b-versatile`); `api/aiDirect.api.ts` calls OpenAI-compatible `/chat/completions` straight from the browser, bypassing the backend.
- `settings.store.ts` for app preferences; `useRateLimit` hook for client-side throttle feedback.

## Authentication Flow

1. Login via `/auth/login` or Google OAuth → tokens in Zustand (+ localStorage backup).
2. `api/client.ts` request interceptor attaches access token; response interceptor refreshes on 401 and replays the request; on refresh failure → logout + redirect to login.
3. `session-cleanup.ts` handles stale session storage on logout.

## Styling

Dark theme via CSS custom properties in `index.css`: near-black background (`--app-bg: #000000`), **violet accent `#8b5cf6`**, glassmorphism surfaces (`--app-glass-bg`). Shared education styles in `pages/Education.css`. Prefer existing token vars and `glass-card`/`btn-primary`-style utility classes over new one-off colors. Note legacy `--stock-*` aliases still exist (see below).

## Testing

- **Unit/component**: 24 files colocated as `src/**/*.test.{ts,tsx}` — run by **vitest** with jsdom (`src/test/setup.ts`), Testing Library. Includes memory/perf-oriented tests (`AdvancedSettings.memory.test.tsx`, `useWebSocket.memory.test.tsx`).
- **Contract**: 20 files in `tests/` — plain `node --test`, no DOM; they pin API paths, normalizers, offline-quiz behavior, landing/UI contracts, and even `nginx.conf` API proxying (`nginx-api-proxy.test.ts`). Update these when you change endpoint shapes.
- CI script: `npm run ci`.

## Backend Integration

API domains: `/auth/*`, `/users/*`, `/education/*` (+`/today`, `/today-plan`, `/coach/summary`, `/learning-plan`, `/streak`, `/progress`, `/logs`, `/exports`), `/flashcards/*`, `/quizzes/*`, `/ai/*`, `/document-import/*`, `/education/leaderboard`, `/school/*` + `/school/classes/*` + `/school/teaching/*` + `/parent/*` + `/timetable/*` + `/attendance/*` + `/grades/*` + `/homework/*` + `/me/homework` (school platform — `api/school.api.ts`, types mirrored in `types/school.types.ts`; responses are plain entities/arrays, no pagination, so most endpoints skip normalizers). All request/response DTOs mirrored in `src/types/`. **Normalizers** in `api/normalizers.ts` convert raw API payloads into view models — keep API-layer changes and `tests/` contract updates in sync.

## Notes / Known Legacy & Gaps

- **Stock-app cleanup (done)**: the dead `useWebSocket.ts` hook (socket.io OHLC feed), `pages/Stock.css`, `isValidStockSymbol()`, the VND `formatCurrency` + `trade-*` color helpers, `hls.js`/`socket.io-client` deps, and root `backup_stockvn_*.dump` files have been removed. Register's ambient/glass styles were extracted into `pages/Register.css`. **Still present by design**: `--stock-*` CSS variables and `stock-*` classes (sidebar/glass/fade) in `index.css`, `styles/education-shell.css`, `styles/stock-redesign.css` — they are the app's live design system despite the legacy name; renaming them is an open refactor, treat the names as historical.
- **Premium/billing is not wired**: `PremiumUpgrade.tsx` shows plans with a "Billing is not enabled yet" toast; there is no subscription/payment backend.
- **Forgot password** routes to `ComingSoon`.
- **AI chat is not streamed** anywhere (no SSE/`getReader`) — responses render only when complete.
- Offline quiz demo mode: `store/quizOfflineAuth.ts` + `mocks/quizOffline.ts` (guarded by `shouldEnableQuizOfflineAuth`).
- `nginx.conf` (prod serving + API proxy) and `API_DOCUMENTATION.md`, `PAGINATION_GUIDE.md` live in this folder for extra context.
