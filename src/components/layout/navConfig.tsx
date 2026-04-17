import {
  LayoutDashboard, Star, Briefcase, BarChart3, Settings,
  GraduationCap, Bot, Trophy, Users, Crown, Compass,
} from 'lucide-react';

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
}

export const learningNavItems: NavItem[] = [
  { icon: <GraduationCap size={20} />, label: 'Khóa học', to: '/education' },
  { icon: <LayoutDashboard size={20} />, label: 'Flashcards', to: '/flashcards' },
  { icon: <Briefcase size={20} />, label: 'Tài liệu', to: '/flashcards/document-import' },
  { icon: <Star size={20} />, label: 'Bài tập', to: '/quiz' },
  { icon: <Bot size={20} />, label: 'AI Tutor', to: '/ai-tutor' },
  { icon: <Trophy size={20} />, label: 'Bảng xếp hạng', to: '/leaderboard' },
  { icon: <Compass size={20} />, label: 'Community', to: '/community' },
  { icon: <Users size={20} />, label: 'Social Feed', to: '/social' },
  { icon: <BarChart3 size={20} />, label: 'Thống kê', to: '/quiz/stats' },
  { icon: <Crown size={20} />, label: 'Premium', to: '/premium' },
  { icon: <Settings size={20} />, label: 'Cài đặt', to: '/settings' },
];
