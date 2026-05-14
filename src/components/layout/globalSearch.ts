export interface GlobalSearchDestination {
  path: string;
  label: string;
}

const destinations: Array<GlobalSearchDestination & { keywords: string[] }> = [
  {
    path: '/flashcards',
    label: 'Flashcards',
    keywords: ['flashcard', 'flashcards', 'the ghi nho', 'tu vung', 'vocabulary'],
  },
  {
    path: '/quiz',
    label: 'Bài tập',
    keywords: ['quiz', 'bai tap', 'kiem tra', 'test', 'practice'],
  },
  {
    path: '/flashcards/document-import',
    label: 'Tài liệu',
    keywords: ['tai lieu', 'document', 'import', 'pdf', 'doc', 'upload'],
  },
  {
    path: '/ai-tutor',
    label: 'AI Tutor',
    keywords: ['ai', 'tutor', 'tro ly', 'gia su'],
  },
  {
    path: '/learning-coach',
    label: 'Coach học tập',
    keywords: ['coach', 'learning coach', 'hoc tap', 'lo trinh', 'ke hoach'],
  },
  {
    path: '/leaderboard',
    label: 'Bảng xếp hạng',
    keywords: ['bang xep hang', 'leaderboard', 'rank', 'ranking'],
  },
  {
    path: '/community',
    label: 'Cộng đồng',
    keywords: ['cong dong', 'community', 'group', 'forum'],
  },
  {
    path: '/social',
    label: 'Social Feed',
    keywords: ['social', 'feed', 'bai viet', 'chia se'],
  },
  {
    path: '/settings',
    label: 'Cài đặt',
    keywords: ['setting', 'settings', 'cai dat', 'preferences'],
  },
  {
    path: '/profile',
    label: 'Hồ sơ',
    keywords: ['profile', 'ho so', 'tai khoan', 'account'],
  },
  {
    path: '/education',
    label: 'Khóa học',
    keywords: ['course', 'courses', 'khoa hoc', 'bai hoc', 'lesson', 'language'],
  },
];

export function normalizeGlobalSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ');
}

export function getGlobalSearchDestination(
  query: string,
): GlobalSearchDestination | null {
  const normalizedQuery = normalizeGlobalSearchQuery(query);
  if (!normalizedQuery) {
    return null;
  }

  const destination =
    destinations.find((item) =>
      item.keywords.some((keyword) => normalizedQuery.includes(keyword)),
    ) ?? destinations[destinations.length - 1];

  return {
    path: destination.path,
    label: destination.label,
  };
}
