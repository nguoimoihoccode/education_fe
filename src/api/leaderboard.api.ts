import { apiClient } from './client';

// ==================== TYPES ====================

export interface LeaderboardUser {
  id: string;
  rank: number;
  displayName: string;
  avatar?: string;
  xp: number;
  streak: number;
  lessonsCompleted: number;
  quizScore: number;
  level: number;
  badge: string;
  change: 'up' | 'down' | 'same';
  changeAmount: number;
}

export interface LeaderboardResponse {
  data: LeaderboardUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentUser?: LeaderboardUser;
}

export interface GlobalStats {
  totalXp: number;
  totalLessons: number;
  totalQuizzesPassed: number;
  totalHoursStudied: number;
}

// ==================== API CALLS ====================

export const getLeaderboard = async (params?: {
  period?: 'week' | 'month' | 'all';
  category?: 'xp' | 'streak' | 'lessons' | 'quiz';
  page?: number;
  limit?: number;
  search?: string;
}): Promise<LeaderboardResponse> => {
  try {
    const response = await apiClient.get('/education/leaderboard', { params });
    return response.data;
  } catch {
    // Fallback: build leaderboard from available data
    return getFallbackLeaderboard();
  }
};

export const getGlobalStats = async (): Promise<GlobalStats> => {
  try {
    const response = await apiClient.get('/education/leaderboard/stats');
    return response.data;
  } catch {
    return {
      totalXp: 0,
      totalLessons: 0,
      totalQuizzesPassed: 0,
      totalHoursStudied: 0,
    };
  }
};

export const getCurrentUserRank = async (): Promise<LeaderboardUser | null> => {
  try {
    const response = await apiClient.get('/education/leaderboard/me');
    return response.data;
  } catch {
    return null;
  }
};

// ==================== FALLBACK ====================

async function getFallbackLeaderboard(): Promise<LeaderboardResponse> {
  // When leaderboard endpoint doesn't exist yet, return empty
  return {
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
}
