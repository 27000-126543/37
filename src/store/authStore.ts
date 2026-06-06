import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockUsers';

interface AuthState {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, role?: UserRole) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  canAccess: (allowedRoles: UserRole[]) => boolean;
}

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: mockUsers,
      isAuthenticated: false,

      login: (username, role) => {
        const users = get().users;
        let found = users.find((u) => u.username === username);
        if (role && found && found.role !== role) {
          found = users.find((u) => u.username === username && u.role === role) || found;
        }
        if (found) {
          set({ user: found, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
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
    }
  )
);
