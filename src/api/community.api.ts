import { apiClient, CACHE_PROFILES } from './client';

// ==================== TYPES ====================

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  icon: string;
  color: string;
  gradient: string;
  category: string;
  isJoined: boolean;
  posts: number;
  lastActive: string;
  isPrivate?: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'challenge' | 'workshop' | 'live' | 'contest';
  participants: number;
  maxParticipants?: number;
  isRegistered: boolean;
  reward?: string;
  host: string;
}

export interface ForumThread {
  id: string;
  title: string;
  category: string;
  author: string;
  authorLevel: number;
  replies: number;
  views: number;
  likes: number;
  lastReply: string;
  isPinned?: boolean;
  isSolved?: boolean;
  tags: string[];
}

export interface SharedResource {
  id: string;
  title: string;
  type: 'deck' | 'guide' | 'notes' | 'video';
  author: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  language: string;
}

export interface TopMember {
  name: string;
  badge: string;
  level: number;
  xp: number;
  streak: number;
  contributions: number;
}

export interface CommunityStats {
  totalMembers: number;
  totalDiscussions: number;
  totalResources: number;
  eventsThisMonth: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

// ==================== API CALLS ====================

export const getStudyGroups = async (params?: {
  search?: string;
  category?: string;
  joined?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<StudyGroup>> => {
  try {
    const response = await apiClient.get('/community/groups', { params, ...CACHE_PROFILES.DYNAMIC });
    return response.data;
  } catch {
    return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
};

export const joinGroup = async (groupId: string): Promise<{ isJoined: boolean }> => {
  try {
    const response = await apiClient.post(`/community/groups/${groupId}/join`);
    return response.data;
  } catch {
    return { isJoined: false };
  }
};

export const leaveGroup = async (groupId: string): Promise<{ isJoined: boolean }> => {
  try {
    const response = await apiClient.delete(`/community/groups/${groupId}/join`);
    return response.data;
  } catch {
    return { isJoined: true };
  }
};

export const getCommunityEvents = async (params?: {
  type?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<CommunityEvent>> => {
  try {
    const response = await apiClient.get('/community/events', { params, ...CACHE_PROFILES.DYNAMIC });
    return response.data;
  } catch {
    return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
};

export const registerEvent = async (eventId: string): Promise<{ isRegistered: boolean }> => {
  try {
    const response = await apiClient.post(`/community/events/${eventId}/register`);
    return response.data;
  } catch {
    return { isRegistered: false };
  }
};

export const unregisterEvent = async (eventId: string): Promise<{ isRegistered: boolean }> => {
  try {
    const response = await apiClient.delete(`/community/events/${eventId}/register`);
    return response.data;
  } catch {
    return { isRegistered: true };
  }
};

export const getForumThreads = async (params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<ForumThread>> => {
  try {
    const response = await apiClient.get('/community/forum/threads', { params, ...CACHE_PROFILES.DYNAMIC });
    return response.data;
  } catch {
    return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
};

export const getSharedResources = async (params?: {
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<SharedResource>> => {
  try {
    const response = await apiClient.get('/community/resources', { params, ...CACHE_PROFILES.DYNAMIC });
    return response.data;
  } catch {
    return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
};

export const getTopMembers = async (limit?: number): Promise<TopMember[]> => {
  try {
    const response = await apiClient.get('/community/top-members', { params: { limit }, ...CACHE_PROFILES.DYNAMIC });
    return response.data;
  } catch {
    return [];
  }
};

export const getCommunityStats = async (): Promise<CommunityStats> => {
  try {
    const response = await apiClient.get('/community/stats', CACHE_PROFILES.STATIC);
    return response.data;
  } catch {
    return { totalMembers: 0, totalDiscussions: 0, totalResources: 0, eventsThisMonth: 0 };
  }
};
