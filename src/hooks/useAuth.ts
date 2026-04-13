import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/api/auth.api';

export const useAuth = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const register = useAuthStore((state) => state.register);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    isAuthenticated,
    accessToken,
    refreshToken,
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    setTokens,
    setUser,
    clearError,
  };
};

// Helper types
export type { User };