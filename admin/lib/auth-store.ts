import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import axiosInstance from './axios';
import { AUTH_CONFIG, ADMIN_ENDPOINTS } from './constants';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          const response = await axiosInstance.post(ADMIN_ENDPOINTS.LOGIN, {
            email,
            password,
          });

          const { data } = response.data;
          
          const admin: Admin = {
            id: data.admin.id,
            email: data.admin.email,
            name: data.admin.name,
            role: data.admin.role || 'admin',
          };

          // Store token in httpOnly cookie for security
          Cookies.set(AUTH_CONFIG.TOKEN_KEY, data.token, {
            expires: AUTH_CONFIG.TOKEN_EXPIRY_DAYS,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          });

          set({
            admin,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          set({ isLoading: false });
          let message = 'Login failed';
          if (typeof error === 'object' && error !== null) {
            const maybeAxiosErr = error as { response?: { data?: { message?: string } } };
            message = maybeAxiosErr.response?.data?.message || message;
          }
          throw new Error(message);
        }
      },

      logout: () => {
        Cookies.remove(AUTH_CONFIG.TOKEN_KEY);
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
        });
      },

      initializeAuth: () => {
        const token = Cookies.get(AUTH_CONFIG.TOKEN_KEY);
        if (token) {
          // Verify token validity here if needed
          try {
            // For now, just set the token - in production, verify with backend
            set({
              token,
              isAuthenticated: true,
            });
          } catch {
            // Token invalid, clear it
            Cookies.remove(AUTH_CONFIG.TOKEN_KEY);
          }
        }
      }
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);