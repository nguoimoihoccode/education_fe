import {
  LayoutDashboard, Star, Briefcase, BarChart3, Settings, Brain,
  GraduationCap, Bot, Crown,
  CircleHelp, School, BookOpen, Users, UserCog, Presentation, Baby,
  CalendarDays,
} from 'lucide-react';

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
  matcher?: (location: { pathname: string; search: string }) => boolean;
  /** When set, the item renders only if the signed-in user has one of these roles. */
  roles?: string[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const learningNavSections: NavSection[] = [
  {
    title: 'Học hôm nay',
    items: [
      { icon: <LayoutDashboard size={20} />, label: 'Hôm nay', to: '/today' },
      {
        icon: <GraduationCap size={20} />,
        label: 'Khóa học',
        to: '/education?view=courses',
        matcher: ({ pathname, search }) => pathname === '/education' && search === '?view=courses',
      },
      { icon: <Star size={20} />, label: 'Flashcards', to: '/flashcards' },
      { icon: <CircleHelp size={20} />, label: 'Quiz', to: '/quiz' },
    ],
  },
  {
    title: 'Khám phá thêm',
    items: [
      { icon: <Brain size={20} />, label: 'Coach', to: '/learning-coach' },
      { icon: <Bot size={20} />, label: 'AI Tutor', to: '/ai-tutor' },
      { icon: <Briefcase size={20} />, label: 'Nhập tài liệu', to: '/flashcards/document-import' },
      { icon: <BarChart3 size={20} />, label: 'Tiến độ', to: '/quiz/stats' },
    ],
  },
  {
    title: 'Tài khoản',
    items: [
      { icon: <Crown size={20} />, label: 'Premium', to: '/premium' },
      { icon: <Settings size={20} />, label: 'Cài đặt', to: '/settings' },
    ],
  },
  {
    title: 'Quản trị trường',
    items: [
      { icon: <School size={20} />, label: 'Tổng quan', to: '/principal', roles: ['principal', 'admin'] },
      { icon: <Users size={20} />, label: 'Lớp học', to: '/principal/classes', roles: ['principal', 'admin'] },
      { icon: <BookOpen size={20} />, label: 'Môn học', to: '/principal/subjects', roles: ['principal', 'admin'] },
      { icon: <UserCog size={20} />, label: 'Giáo viên', to: '/principal/teachers', roles: ['principal', 'admin'] },
      { icon: <CalendarDays size={20} />, label: 'Thời khoá biểu', to: '/principal/timetable', roles: ['principal', 'admin'] },
    ],
  },
  {
    title: 'Lớp của tôi',
    items: [
      { icon: <Presentation size={20} />, label: 'Lớp chủ nhiệm', to: '/teaching', roles: ['teacher', 'principal', 'admin'] },
      { icon: <CalendarDays size={20} />, label: 'TKK của tôi', to: '/teaching/timetable', roles: ['teacher', 'principal', 'admin'] },
    ],
  },
  {
    title: 'Trường của tôi',
    items: [
      { icon: <CalendarDays size={20} />, label: 'TKK của tôi', to: '/me/school', roles: ['student', 'admin'] },
    ],
  },
  {
    title: 'Con của tôi',
    items: [
      { icon: <Baby size={20} />, label: 'Hồ sơ con', to: '/parent', roles: ['parent', 'admin'] },
    ],
  },
];

export const learningNavItems: NavItem[] = learningNavSections.flatMap(
  (section) => section.items,
);
