import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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