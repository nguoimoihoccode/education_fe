import { apiClient } from './client';

// ==================== TYPES ====================

export interface SocialPostAuthor {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  badge: string;
}

export interface SocialComment {
  id: string;
  authorId: string;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface SocialPost {
  id: string;
  author: SocialPostAuthor;
  content: string;
  image?: string;
  likes: number;
  comments: SocialComment[];
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  tags: string[];
  type: 'achievement' | 'question' | 'share' | 'milestone';
}

export interface SocialFeedResponse {
  data: SocialPost[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TrendingTopic {
  tag: string;
  posts: string;
}

export interface CreatePostDto {
  content: string;
  image?: string;
  tags?: string[];
  type?: 'achievement' | 'question' | 'share' | 'milestone';
}

// ==================== API CALLS ====================

export const getSocialFeed = async (params?: {
  type?: string;
  page?: number;
  limit?: number;
}): Promise<SocialFeedResponse> => {
  try {
    const response = await apiClient.get('/social/feed', { params });
    return response.data;
  } catch {
    return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
};

export const createPost = async (dto: CreatePostDto): Promise<SocialPost> => {
  const response = await apiClient.post('/social/posts', dto);
  return response.data;
};

export const likePost = async (postId: string): Promise<{ likes: number; isLiked: boolean }> => {
  try {
    const response = await apiClient.post(`/social/posts/${postId}/like`);
    return response.data;
  } catch {
    return { likes: 0, isLiked: false };
  }
};

export const bookmarkPost = async (postId: string): Promise<{ isBookmarked: boolean }> => {
  try {
    const response = await apiClient.post(`/social/posts/${postId}/bookmark`);
    return response.data;
  } catch {
    return { isBookmarked: false };
  }
};

export const addComment = async (
  postId: string,
  content: string
): Promise<SocialComment> => {
  const response = await apiClient.post(`/social/posts/${postId}/comments`, { content });
  return response.data;
};

export const getTrendingTopics = async (): Promise<TrendingTopic[]> => {
  try {
    const response = await apiClient.get('/social/trending');
    return response.data;
  } catch {
    return [];
  }
};
