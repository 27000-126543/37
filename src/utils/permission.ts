import type {
  User,
  UserRole,
  Permission,
  PermissionAction,
  ResourceType,
} from '@/types';

const ROLE_PERMISSIONS: Record<UserRole, Array<{ action: PermissionAction; resource: ResourceType }>> = {
  admin: [
    { action: 'create', resource: 'user' },
    { action: 'read', resource: 'user' },
    { action: 'update', resource: 'user' },
    { action: 'delete', resource: 'user' },
    { action: 'create', resource: 'course' },
    { action: 'read', resource: 'course' },
    { action: 'update', resource: 'course' },
    { action: 'delete', resource: 'course' },
    { action: 'create', resource: 'lesson' },
    { action: 'read', resource: 'lesson' },
    { action: 'update', resource: 'lesson' },
    { action: 'delete', resource: 'lesson' },
    { action: 'create', resource: 'quiz' },
    { action: 'read', resource: 'quiz' },
    { action: 'update', resource: 'quiz' },
    { action: 'delete', resource: 'quiz' },
    { action: 'read', resource: 'report' },
    { action: 'export', resource: 'report' },
    { action: 'import', resource: 'report' },
    { action: 'read', resource: 'danmaku' },
    { action: 'delete', resource: 'danmaku' },
    { action: 'manage', resource: 'danmaku' },
    { action: 'read', resource: 'comment' },
    { action: 'delete', resource: 'comment' },
    { action: 'create', resource: 'announcement' },
    { action: 'read', resource: 'announcement' },
    { action: 'update', resource: 'announcement' },
    { action: 'delete', resource: 'announcement' },
    { action: 'read', resource: 'setting' },
    { action: 'update', resource: 'setting' },
    { action: 'manage', resource: 'setting' },
    { action: 'review', resource: 'course' },
    { action: 'approve', resource: 'course' },
  ],
  dean: [
    { action: 'read', resource: 'user' },
    { action: 'update', resource: 'user' },
    { action: 'create', resource: 'course' },
    { action: 'read', resource: 'course' },
    { action: 'update', resource: 'course' },
    { action: 'delete', resource: 'course' },
    { action: 'read', resource: 'lesson' },
    { action: 'read', resource: 'quiz' },
    { action: 'read', resource: 'report' },
    { action: 'export', resource: 'report' },
    { action: 'read', resource: 'danmaku' },
    { action: 'manage', resource: 'danmaku' },
    { action: 'delete', resource: 'danmaku' },
    { action: 'read', resource: 'comment' },
    { action: 'delete', resource: 'comment' },
    { action: 'create', resource: 'announcement' },
    { action: 'read', resource: 'announcement' },
    { action: 'update', resource: 'announcement' },
    { action: 'delete', resource: 'announcement' },
    { action: 'review', resource: 'course' },
    { action: 'approve', resource: 'course' },
  ],
  academic: [
    { action: 'read', resource: 'user' },
    { action: 'update', resource: 'user' },
    { action: 'create', resource: 'course' },
    { action: 'read', resource: 'course' },
    { action: 'update', resource: 'course' },
    { action: 'delete', resource: 'course' },
    { action: 'read', resource: 'lesson' },
    { action: 'read', resource: 'quiz' },
    { action: 'read', resource: 'report' },
    { action: 'export', resource: 'report' },
    { action: 'read', resource: 'danmaku' },
    { action: 'manage', resource: 'danmaku' },
    { action: 'delete', resource: 'danmaku' },
    { action: 'read', resource: 'comment' },
    { action: 'delete', resource: 'comment' },
    { action: 'create', resource: 'announcement' },
    { action: 'read', resource: 'announcement' },
    { action: 'update', resource: 'announcement' },
    { action: 'delete', resource: 'announcement' },
    { action: 'review', resource: 'course' },
    { action: 'approve', resource: 'course' },
  ],
  teacher: [
    { action: 'read', resource: 'user' },
    { action: 'create', resource: 'course' },
    { action: 'read', resource: 'course' },
    { action: 'update', resource: 'course' },
    { action: 'create', resource: 'lesson' },
    { action: 'read', resource: 'lesson' },
    { action: 'update', resource: 'lesson' },
    { action: 'create', resource: 'quiz' },
    { action: 'read', resource: 'quiz' },
    { action: 'update', resource: 'quiz' },
    { action: 'delete', resource: 'quiz' },
    { action: 'read', resource: 'report' },
    { action: 'export', resource: 'report' },
    { action: 'read', resource: 'danmaku' },
    { action: 'delete', resource: 'danmaku' },
    { action: 'read', resource: 'comment' },
    { action: 'delete', resource: 'comment' },
    { action: 'read', resource: 'announcement' },
  ],
  lecturer: [
    { action: 'read', resource: 'user' },
    { action: 'create', resource: 'course' },
    { action: 'read', resource: 'course' },
    { action: 'update', resource: 'course' },
    { action: 'create', resource: 'lesson' },
    { action: 'read', resource: 'lesson' },
    { action: 'update', resource: 'lesson' },
    { action: 'create', resource: 'quiz' },
    { action: 'read', resource: 'quiz' },
    { action: 'update', resource: 'quiz' },
    { action: 'delete', resource: 'quiz' },
    { action: 'read', resource: 'report' },
    { action: 'export', resource: 'report' },
    { action: 'read', resource: 'danmaku' },
    { action: 'delete', resource: 'danmaku' },
    { action: 'read', resource: 'comment' },
    { action: 'delete', resource: 'comment' },
    { action: 'read', resource: 'announcement' },
  ],
  assistant: [
    { action: 'read', resource: 'user' },
    { action: 'read', resource: 'course' },
    { action: 'read', resource: 'lesson' },
    { action: 'read', resource: 'quiz' },
    { action: 'update', resource: 'quiz' },
    { action: 'read', resource: 'report' },
    { action: 'read', resource: 'danmaku' },
    { action: 'delete', resource: 'danmaku' },
    { action: 'read', resource: 'comment' },
    { action: 'delete', resource: 'comment' },
    { action: 'read', resource: 'announcement' },
  ],
  student: [
    { action: 'read', resource: 'user' },
    { action: 'update', resource: 'user' },
    { action: 'read', resource: 'course' },
    { action: 'read', resource: 'lesson' },
    { action: 'read', resource: 'quiz' },
    { action: 'create', resource: 'danmaku' },
    { action: 'read', resource: 'danmaku' },
    { action: 'create', resource: 'comment' },
    { action: 'read', resource: 'comment' },
    { action: 'read', resource: 'announcement' },
  ],
  guest: [
    { action: 'read', resource: 'course' },
    { action: 'read', resource: 'announcement' },
  ],
};

function getRolePermissions(role: UserRole): Permission[] {
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.map(p => ({ action: p.action, resource: p.resource }));
}

function getAllPermissions(user: User): Permission[] {
  const rolePerms = getRolePermissions(user.role);
  const customPerms = user.permissions ?? [];
  return [...rolePerms, ...customPerms];
}

export function hasPermission(
  user: User,
  action: PermissionAction,
  resource: ResourceType,
  targetId?: string,
): boolean {
  const allPerms = getAllPermissions(user);

  for (const perm of allPerms) {
    const actionMatch = perm.action === action || perm.action === 'manage';
    const resourceMatch = perm.resource === resource;
    if (actionMatch && resourceMatch) {
      if (perm.condition) {
        return perm.condition(user.id, targetId);
      }
      return true;
    }
  }

  return false;
}

export function hasAnyPermission(
  user: User,
  checks: Array<{ action: PermissionAction; resource: ResourceType }>,
): boolean {
  return checks.some(c => hasPermission(user, c.action, c.resource));
}

export function hasAllPermissions(
  user: User,
  checks: Array<{ action: PermissionAction; resource: ResourceType }>,
): boolean {
  return checks.every(c => hasPermission(user, c.action, c.resource));
}

export function requirePermission(
  user: User,
  action: PermissionAction,
  resource: ResourceType,
  errorMessage: string = '无操作权限',
): void {
  if (!hasPermission(user, action, resource)) {
    throw new Error(errorMessage);
  }
}

export function filterByPermission<T extends { ownerId?: string; id?: string; teacherId?: string }>(
  user: User,
  items: T[],
  action: PermissionAction,
  resource: ResourceType,
): T[] {
  return items.filter(item => hasPermission(
    user,
    action,
    resource,
    item.id ?? item.ownerId ?? item.teacherId,
  ));
}

export function getRoleHierarchy(): Record<UserRole, number> {
  return {
    admin: 7,
    dean: 6,
    academic: 5,
    teacher: 4,
    lecturer: 3,
    assistant: 2,
    student: 1,
    guest: 0,
  };
}

export function isRoleAboveOrEqual(roleA: UserRole, roleB: UserRole): boolean {
  const hierarchy = getRoleHierarchy();
  return hierarchy[roleA] >= hierarchy[roleB];
}

export function canManageRole(user: User, targetRole: UserRole): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'dean' || user.role === 'academic') return targetRole === 'teacher' || targetRole === 'lecturer' || targetRole === 'assistant' || targetRole === 'student' || targetRole === 'guest';
  if (user.role === 'teacher' || user.role === 'lecturer') return targetRole === 'assistant' || targetRole === 'student' || targetRole === 'guest';
  if (user.role === 'assistant') return targetRole === 'student' || targetRole === 'guest';
  return false;
}

export function getUserPermissionsSummary(user: User): {
  role: UserRole;
  canManageUsers: boolean;
  canManageCourses: boolean;
  canManageContent: boolean;
  canViewReports: boolean;
  canExport: boolean;
  canReviewCourses: boolean;
} {
  return {
    role: user.role,
    canManageUsers: hasPermission(user, 'manage', 'user'),
    canManageCourses: hasPermission(user, 'manage', 'course') || hasAllPermissions(user, [
      { action: 'create', resource: 'course' },
      { action: 'update', resource: 'course' },
      { action: 'delete', resource: 'course' },
    ]),
    canManageContent: hasAnyPermission(user, [
      { action: 'manage', resource: 'danmaku' },
      { action: 'manage', resource: 'comment' },
    ]),
    canViewReports: hasPermission(user, 'read', 'report'),
    canExport: hasPermission(user, 'export', 'report'),
    canReviewCourses: hasPermission(user, 'review', 'course') || hasPermission(user, 'approve', 'course'),
  };
}
