import axios from 'axios';
import { setupCache, buildMemoryStorage, buildWebStorage } from 'axios-cache-interceptor';
import { useAuthStore } from '../store/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Tạo base axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
    // Ưu tiên đọc từ store, fallback về localStorage
    const store = useAuthStore.getState();
    const token = store.accessToken || localStorage.getItem('accessToken');
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
        // Đọc refreshToken từ store hoặc localStorage
        let refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          refreshToken = localStorage.getItem('refreshToken');
        }

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi refresh token API
        const response = await apiClient.post('/auth/refresh', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken, user } = response.data;

        // Cập nhật store với tokens mới (giữ nguyên user nếu không có user mới)
        useAuthStore.getState().setTokens(
          accessToken,
          newRefreshToken || refreshToken,
          user
        );

        // Cập nhật localStorage (backup)
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout và chuyển về login
        useAuthStore.getState().logout();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage'); // Zustand persisted state

        // Clear API cache khi logout
        apiClient.storage.clear?.();

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