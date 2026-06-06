import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { auth } from '@/services/api';

const rolePriority: Record<UserRole, number> = {
  admin: 5,
  dean: 4,
  teacher: 3,
  assistant: 2,
  student: 1,
  academic: 3,
  lecturer: 3,
  guest: 0,
};

interface AuthState {
  user: User | null;
  token: string | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  switchRole: (role: UserRole) => void;
  canAccess: (allowedRoles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      users: [],
      isAuthenticated: false,

      login: async (username, password, role) => {
        try {
          const response = await auth.login(username, password, role);
          set({
            user: response.user as User,
            token: response.token,
            isAuthenticated: true,
          });
          return true;
        } catch {
          return false;
        }
      },

      logout: async () => {
        try {
          await auth.logout();
        } catch {
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      getCurrentUser: async () => {
        try {
          const user = await auth.getCurrentUser();
          set({ user: user as User, isAuthenticated: true });
          return user as User;
        } catch {
          set({ user: null, isAuthenticated: false });
          return null;
        }
      },

      switchRole: (role) => {
        const { user, users } = get();
        if (!user) return;
        const sameUser = users.find((u) => u.username === user.username && u.role === role);
        if (sameUser) {
          set({ user: sameUser });
        }
      },

      canAccess: (allowedRoles) => {
        const { user } = get();
        if (!user) return false;
        if (allowedRoles.length === 0) return true;
        return allowedRoles.some((r) => {
          if (r === user.role) return true;
          return rolePriority[user.role] >= rolePriority[r];
        });
      },
    }),
    {
      name: 'edu-auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
