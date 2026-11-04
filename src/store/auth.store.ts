import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type User } from '../api/auth.api';
import { clearApiSessionState } from '../api/client';


interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string, user?: User | null) => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (identifier: string, password: string) => {
        clearApiSessionState();
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ identifier, password });
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      register: async (email: string, password: string, displayName?: string) => {
        clearApiSessionState();
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ email, password, displayName });
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Đăng ký thất bại';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });

        clearApiSessionState();
      },

      setTokens: (accessToken: string, refreshToken: string, user?: User | null) => {
        if (user && get().user && user.id !== get().user?.id) clearApiSessionState();
        set({
          accessToken,
          refreshToken,
          user: user ?? get().user,
          isAuthenticated: !!accessToken,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
