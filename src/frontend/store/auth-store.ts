import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the store interface
interface AuthState {
  userId: string | null;
  jwt: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (userId: string, email: string) => void;
  setAuthJwt: (jwt: string, email: string) => void;
  logout: () => void;
}

// Zustand store for authentication
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      jwt: null,
      email: null,
      isAuthenticated: false,
      setAuth: (userId, email) => {
        set({ userId, email, isAuthenticated: true });
      },
      setAuthJwt: (jwt, email) => {
        set({ jwt, email, isAuthenticated: true });
      },
      logout: () => {
        set({ userId: null, email: null, jwt: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);