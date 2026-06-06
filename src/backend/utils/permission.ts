export type UserRole = 'student' | 'assistant' | 'teacher' | 'dean' | 'admin';

export const ROLE_LEVELS: Record<UserRole, number> = {
  student: 1,
  assistant: 2,
  teacher: 3,
  dean: 4,
  admin: 5,
};

export function checkRole(userRole: string, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole as UserRole);
}

export function getRoleLevel(role: string): number {
  return ROLE_LEVELS[role as UserRole] ?? 0;
}
