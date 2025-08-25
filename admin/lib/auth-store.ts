import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
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
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
          }

          const data = await response.json();
          
          const admin: Admin = {
            id: data.admin.id,
            email: data.admin.email,
            name: data.admin.name,
            role: data.admin.role || 'admin',
          };

          // Store token in httpOnly cookie for security
          Cookies.set('admin_token', data.token, {
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          });

          set({
            admin,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('admin_token');
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
        });
      },

      initializeAuth: () => {
        const token = Cookies.get('admin_token');
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
            Cookies.remove('admin_token');
          }
        }
      },
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