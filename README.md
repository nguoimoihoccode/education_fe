# Education Platform Frontend

React frontend cho nền tảng giáo dục ngôn ngữ được xây dựng với Vite, TypeScript, React Router, TanStack Query, và React Hot Toast.

## 🚀 Features

- ✅ **Authentication**
  - Login/Register với JWT
  - Đăng nhập bằng Google OAuth
  - Auto token refresh
  - Protected routes

- ✅ **Education Platform**
  - Course catalog với filtering
  - Lesson viewer với progress tracking
  - Vocabulary learning với spaced repetition
  - Interactive exercises
  - User progress tracking với streaks và XP
  - Gamification với levels và achievements

- ✅ **State Management**
  - Zustand cho auth state
  - TanStack Query cho server state
  - Toast notifications cho user feedback

## 📋 Prerequisites

- Node.js >= 18
- npm hoặc yarn
- Backend API đang chạy tại `http://localhost:3000`

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env nếu cần thay đổi API URL

# Start development server
npm run dev
```

## ⚙️ Configuration

### Environment Variables (.env)

Tạo file `.env` trong thư mục `stock-fe`:

```env
# Backend API URL (bắt buộc)
VITE_API_URL=http://localhost:3000

# Google OAuth Client ID (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Lưu ý**: Frontend đã được tích hợp sẵn Google Login, không cần cấu hình thêm gì ở frontend. Chỉ cần đảm bảo:
1. Backend đã setup Google OAuth credentials
2. Backend đang chạy và có biến môi trường `FRONTEND_URL` trỏ về frontend URL

## 📁 Project Structure

```
src/
├── api/              # API clients
│   ├── client.ts     # Axios instance với interceptors
│   ├── auth.api.ts   # Authentication endpoints
│   └── education.api.ts  # Education platform endpoints
├── components/       # Reusable components
│   ├── auth/         # ProtectedRoute
│   ├── effects/      # NeonBackground, animations
│   ├── layout/       # Layout wrapper
│   └── ui/           # Button, Card, Badge, Input, SearchBar
├── config/           # App configuration
│   ├── query.ts      # React Query config
│   └── routes.ts     # Routes configuration
├── hooks/            # Custom hooks
│   ├── useAuth.ts    # Auth hook
│   └── useResponsive.ts  # Responsive utilities
├── pages/            # Page components
│   ├── LandingPage.tsx      # Home page
│   ├── Login.tsx           # Login page với Google OAuth
│   ├── Register.tsx        # Register page
│   ├── GoogleCallback.tsx  # Google OAuth callback
│   ├── Education.tsx       # Education platform home
│   ├── CourseDetail.tsx    # Course detail page
│   └── LessonView.tsx      # Lesson viewer page
├── store/            # State management
│   └── auth.store.ts  # Zustand auth store
├── styles/           # Global styles
│   └── animations.css  # Animation library
├── types/            # TypeScript types
│   ├── common.types.ts     # Shared types
│   ├── education.types.ts  # Education platform types
│   └── api/                # API types
└── utils/            # Utility functions
    ├── formatters.ts  # Format functions
    ├── validators.ts  # Validation helpers
    └── constants.ts   # App constants
```

## 🧪 Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## 🔌 API Integration

### Authentication
- Auto token injection vào requests
- Auto refresh token khi expired
- Redirect to login khi unauthorized

### Education Platform
- Course enrollment và progress tracking
- Lesson completion với time tracking
- Vocabulary review với spaced repetition
- Exercise submission với scoring
- User streaks và XP tracking

## 🎨 Styling

- Tailwind CSS v4 cho styling
- Dark cyberpunk theme với neon colors
- Glassmorphism effects
- Responsive design với mobile-first approach
- Custom animations trong `animations.css`

## 📝 Documentation

- [CLAUDE.md](./CLAUDE.md) - Comprehensive development guide
- [docs/GOOGLE_LOGIN_SETUP.md](./docs/GOOGLE_LOGIN_SETUP.md) - Google OAuth setup guide
- [docs/BE_AUTH_USER_PROFILE.md](./docs/BE_AUTH_USER_PROFILE.md) - Backend API documentation

## 🎯 Key Features

### Course Catalog
- Filter by language và level
- Paginated course listing
- Course preview với thumbnails
- Enrollment tracking

### Lesson Viewer
- Lesson content với rich text
- Progress tracking
- Time spent tracking
- Exercise integration

### Vocabulary Learning
- Spaced repetition system
- Quality-based review scheduling
- Pronunciation và examples
- Progress tracking

### Interactive Exercises
- Multiple exercise types (multiple choice, fill blank, matching, etc.)
- Real-time feedback
- Score tracking
- Progress analytics

### Gamification
- User streaks
- XP system
- Level progression
- Achievement tracking

## 📄 License

UNLICENSED
