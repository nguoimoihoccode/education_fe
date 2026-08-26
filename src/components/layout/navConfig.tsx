import {
  LayoutDashboard, Star, Briefcase, BarChart3, Settings, Brain,
  GraduationCap, Bot, Crown,
  CircleHelp,
} from 'lucide-react';

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
  matcher?: (location: { pathname: string; search: string }) => boolean;
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
];

export const learningNavItems: NavItem[] = learningNavSections.flatMap(
  (section) => section.items,
);
