import { apiClient, CACHE_PROFILES } from './client';

export interface User {
  id: string;
  email: string;
  displayName: string;
  roles?: string[];
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type LoginSession = {
  tokenId: string;
  userId: number;
  email: string;
  displayName?: string;
  ipAddress?: string;
  userAgent?: string;
  device: string;
  browser: string;
  os: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt: string;
  isRevoked: boolean;
  isCurrentSession: boolean;
};

export type AdminSessionFilters = {
  userId?: number;
  email?: string;
  active?: boolean;
};

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  getMySessions: async (): Promise<LoginSession[]> => {
    const response = await apiClient.get<LoginSession[]>('/auth/sessions', CACHE_PROFILES.NO_CACHE);
    return response.data;
  },

  revokeMySession: async (tokenId: string): Promise<void> => {
    await apiClient.delete(`/auth/sessions/${tokenId}`, { cache: false });
  },

  revokeOtherSessions: async (): Promise<void> => {
    await apiClient.delete('/auth/sessions', { cache: false });
  },

  getAdminSessions: async (filters?: AdminSessionFilters): Promise<LoginSession[]> => {
    const response = await apiClient.get<LoginSession[]>('/auth/admin/sessions', {
      params: filters,
      ...CACHE_PROFILES.NO_CACHE,
    });
    return response.data;
  },

  revokeAdminSession: async (tokenId: string): Promise<void> => {
    await apiClient.delete(`/auth/admin/sessions/${tokenId}`, { cache: false });
  },
};
