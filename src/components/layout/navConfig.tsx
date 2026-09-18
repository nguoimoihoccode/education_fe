import {
  LayoutDashboard, Star, Briefcase, BarChart3, Settings, Brain,
  GraduationCap, Bot, Crown,
  CircleHelp, School, BookOpen, Users, UserCog, Presentation, Baby,
  CalendarDays, CalendarRange, ClipboardList, NotebookPen,
} from 'lucide-react';
import { isSchoolStaff, SCHOOL_WRITE_ROLES } from '@/hooks/useCanWriteSchool';

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
  matcher?: (location: { pathname: string; search: string }) => boolean;
  /**
   * When set, the item renders only if the signed-in user has one of these roles.
   *
   * Only the *staff* groups carry one ("Quản trị trường", "Lớp của tôi"): those
   * pages are relationship-scoped, and the way to have a homeroom class is to
   * hold a school write role, so gating them hides noise rather than access.
   *
   * The personal groups ("Trường của tôi", "Con của tôi") deliberately leave it
   * off, and must keep doing so: the `student` role is not read anywhere else in
   * the app, and a parent account only gains `parent` *after* claiming an invite
   * code -- gating either one would hide the very page that hands out the role.
   */
  roles?: string[];
}

/** Stable key for a group: the title is a label and may be reworded. */
export type NavSectionId =
  | 'school-admin'
  | 'my-classes'
  | 'learning'
  | 'my-school'
  | 'my-children'
  | 'account';

export interface NavSection {
  id: NavSectionId;
  title: string;
  items: NavItem[];
}

/** MySchoolPage's tabs. It keeps the default tab in the URL by *dropping*
    `?tab=`, so the timetable item matches `/me/school` with no tab (or an
    unknown one) instead of `?tab=timetable`. */
const SCHOOL_TABS = ['timetable', 'grades', 'homework'];

export const learningNavSections: NavSection[] = [
  {
    id: 'learning',
    title: 'Học tập',
    items: [
      { icon: <LayoutDashboard size={20} />, label: 'Hôm nay', to: '/today' },
      {
        icon: <GraduationCap size={20} />,
        label: 'Khóa học',
        to: '/education?view=courses',
        matcher: ({ pathname, search }) => pathname === '/education' && search === '?view=courses',
      },
      { icon: <Star size={20} />, label: 'Flashcards', to: '/flashcards' },
      // A sub-page of Flashcards, kept next to it rather than in a group of its
      // own -- the same for `Tiến độ` below, which is `/quiz/stats`.
      { icon: <Briefcase size={20} />, label: 'Nhập tài liệu', to: '/flashcards/document-import' },
      { icon: <CircleHelp size={20} />, label: 'Quiz', to: '/quiz' },
      { icon: <BarChart3 size={20} />, label: 'Tiến độ', to: '/quiz/stats' },
      { icon: <Brain size={20} />, label: 'Coach', to: '/learning-coach' },
      { icon: <Bot size={20} />, label: 'AI Tutor', to: '/ai-tutor' },
    ],
  },
  {
    id: 'my-school',
    title: 'Trường của tôi',
    items: [
      // Three deep links into one page's tabs, mirroring the tab bar exactly so
      // a label is the tab it opens. `NavLink` matches on pathname alone, so
      // each needs a matcher reading `?tab=` or all three would light up on
      // `/me/school` (same reason `/education?view=courses` carries one).
      {
        icon: <CalendarRange size={20} />,
        label: 'Thời khoá biểu',
        to: '/me/school',
        matcher: ({ pathname, search }) =>
          pathname === '/me/school' &&
          !SCHOOL_TABS.includes(new URLSearchParams(search).get('tab') ?? ''),
      },
      {
        icon: <ClipboardList size={20} />,
        label: 'Điểm',
        to: '/me/school?tab=grades',
        matcher: ({ pathname, search }) =>
          pathname === '/me/school' && new URLSearchParams(search).get('tab') === 'grades',
      },
      {
        icon: <NotebookPen size={20} />,
        label: 'Bài tập về nhà',
        to: '/me/school?tab=homework',
        matcher: ({ pathname, search }) =>
          pathname === '/me/school' && new URLSearchParams(search).get('tab') === 'homework',
      },
    ],
  },
  {
    id: 'my-children',
    title: 'Con của tôi',
    items: [
      { icon: <Baby size={20} />, label: 'Hồ sơ con', to: '/parent' },
    ],
  },
  {
    id: 'school-admin',
    title: 'Quản trị trường',
    items: [
      { icon: <School size={20} />, label: 'Tổng quan', to: '/principal', roles: ['principal', 'admin'] },
      { icon: <Users size={20} />, label: 'Lớp học', to: '/principal/classes', roles: ['principal', 'admin'] },
      { icon: <BookOpen size={20} />, label: 'Môn học', to: '/principal/subjects', roles: ['principal', 'admin'] },
      { icon: <UserCog size={20} />, label: 'Giáo viên', to: '/principal/teachers', roles: ['principal', 'admin'] },
      // "Xếp" rather than plain "Thời khoá biểu": this is the school-wide builder,
      // while the "Trường của tôi" group below already has a "Thời khoá biểu" --
      // the personal weekly grid. A principal sees both cards, and two entries
      // with one name would leave them guessing which is which.
      { icon: <CalendarDays size={20} />, label: 'Xếp thời khoá biểu', to: '/principal/timetable', roles: ['principal', 'admin'] },
    ],
  },
  {
    id: 'my-classes',
    title: 'Lớp của tôi',
    items: [
      // `/teaching/timetable` is deliberately absent: it renders the same
      // `MyTimetablePanel` as the "Thời khoá biểu" tab above, so listing both
      // gave one page two menu entries. The route stays valid and reachable.
      { icon: <Presentation size={20} />, label: 'Lớp chủ nhiệm', to: '/teaching', roles: SCHOOL_WRITE_ROLES },
    ],
  },
  {
    id: 'account',
    title: 'Tài khoản',
    items: [
      { icon: <Crown size={20} />, label: 'Premium', to: '/premium' },
      { icon: <Settings size={20} />, label: 'Cài đặt', to: '/settings' },
    ],
  },
];

/* This is the one thing about the menu that changes with the viewer: a teacher
   or a school admin opens the app to work, so their school groups lead; everyone
   else is here to learn. `Tài khoản` is last for both -- it used to sit between
   the two halves and split them. */
const STAFF_ORDER = [
  'school-admin', 'my-classes', 'learning', 'my-school', 'my-children', 'account',
] as const;

const LEARNER_ORDER = ['learning', 'my-school', 'my-children', 'account'] as const;

export function navSectionsFor(roles: string[]): NavSection[] {
  const order: readonly NavSectionId[] = isSchoolStaff(roles) ? STAFF_ORDER : LEARNER_ORDER;
  const byId = new Map(learningNavSections.map((section) => [section.id, section]));

  return order.flatMap((id) => {
    const section = byId.get(id);
    return section ? [section] : [];
  });
}

export const learningNavItems: NavItem[] = learningNavSections.flatMap(
  (section) => section.items,
);