import axios from 'axios';
import { setupCache, buildWebStorage } from 'axios-cache-interceptor';
import { useAuthStore } from '../store/auth.store';
import { clearClientSessionStorage } from './session-cleanup';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Tạo base axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup cache interceptor
// - Memory storage cho speed, web storage (sessionStorage) cho persistence across refreshes
export const apiClient = setupCache(axiosInstance, {
  // Cache storage: kết hợp memory + sessionStorage
  storage: buildWebStorage(sessionStorage, 'edupro-api-cache:'),
  
  // Các config mặc định cho tất cả requests
  ttl: 5 * 60 * 1000, // 5 phút - giống staleTime của TanStack Query

  // Chỉ cache GET requests
  methods: ['get'],

  // Interpret cache-control headers từ server (nếu có)
  interpretHeader: true,

  // Cho phép ETag / If-None-Match
  etag: true,

  // Cho phép Last-Modified / If-Modified-Since
  modifiedSince: true,

  // Stale-while-revalidate: dùng cache cũ trong khi fetch data mới
  staleIfError: true,
});

let refreshPromise: Promise<string> | null = null;
let sessionGeneration = 0;

export const clearApiSessionState = () => {
  sessionGeneration += 1;
  refreshPromise = null;
  apiClient.storage.clear?.();
  clearClientSessionStorage();
};

// ============================================
// Cache config cho từng loại API
// ============================================
export const CACHE_PROFILES = {
  // Data ít thay đổi - cache lâu
  STATIC: {
    cache: {
      ttl: 30 * 60 * 1000, // 30 phút
    },
  },
  // Data thay đổi thường xuyên - cache ngắn
  DYNAMIC: {
    cache: {
      ttl: 2 * 60 * 1000, // 2 phút
    },
  },
  // Realtime data - không cache
  NO_CACHE: {
    cache: false as const,
  },
  // Data user-specific - cache vừa
  USER: {
    cache: {
      ttl: 5 * 60 * 1000, // 5 phút
    },
  },
} as const;

// Request interceptor để thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý 401 và không phải request refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshGeneration = sessionGeneration;

        refreshPromise ??= apiClient
          .post('/auth/refresh', { refreshToken }, { cache: false })
          .then((response) => {
            if (refreshGeneration !== sessionGeneration) {
              throw new Error('Session changed during refresh');
            }

            const { accessToken, refreshToken: newRefreshToken, user } = response.data;

            useAuthStore.getState().setTokens(
              accessToken,
              newRefreshToken || refreshToken,
              user
            );

            return accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });

        const accessToken = await refreshPromise;

        // Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout và chuyển về login
        useAuthStore.getState().logout();
        clearApiSessionState();

        // Chỉ redirect nếu không phải request login
        if (!originalRequest.url?.includes('/auth/login')) {
          window.location.href = '/login?error=session_expired';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
