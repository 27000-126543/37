import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Radio,
  FileText,
  ClipboardCheck,
  Award,
  BarChart3,
  UserCheck,
  UserCircle,
  Users,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  allowedRoles: UserRole[];
}

export const menuItems: SidebarMenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    allowedRoles: ['admin', 'dean', 'academic', 'teacher', 'lecturer', 'assistant', 'student', 'guest'],
  },
  {
    key: 'courses',
    label: '课程',
    icon: BookOpen,
    href: '/courses',
    allowedRoles: ['admin', 'dean', 'academic', 'teacher', 'lecturer', 'assistant', 'student', 'guest'],
  },
  {
    key: 'live',
    label: '直播',
    icon: Radio,
    href: '/live',
    allowedRoles: ['admin', 'dean', 'academic', 'teacher', 'lecturer', 'student'],
  },
  {
    key: 'assignments',
    label: '作业',
    icon: FileText,
    href: '/assignments',
    allowedRoles: ['admin', 'dean', 'academic', 'teacher', 'lecturer', 'assistant', 'student'],
  },
  {
    key: 'exams',
    label: '考试',
    icon: ClipboardCheck,
    href: '/exams',
    allowedRoles: ['admin', 'dean', 'academic', 'teacher', 'lecturer', 'assistant', 'student'],
  },
  {
    key: 'certificates',
    label: '证书',
    icon: Award,
    href: '/certificates',
    allowedRoles: ['admin', 'dean', 'academic', 'teacher', 'lecturer', 'student'],
  },
  {
    key: 'analytics',
    label: '学习分析',
    icon: BarChart3,
    href: '/analytics',
    allowedRoles: ['admin', 'dean', 'academic', 'teacher', 'lecturer', 'student'],
  },
  {
    key: 'teacher-review',
    label: '师资审核',
    icon: UserCheck,
    href: '/teachers',
    allowedRoles: ['admin', 'dean', 'academic', 'teacher', 'lecturer'],
  },
  {
    key: 'profile',
    label: '个人中心',
    icon: UserCircle,
    href: '/profile',
    allowedRoles: ['admin', 'dean', 'academic', 'teacher', 'lecturer', 'assistant', 'student'],
  },
  {
    key: 'users',
    label: '用户管理',
    icon: Users,
    href: '/users',
    allowedRoles: ['admin', 'dean', 'academic'],
  },
];

export interface SidebarProps {
  activeKey?: string;
  onSelect?: (key: string, href?: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

const roleLabels: Record<UserRole, string> = {
  admin: '管理员',
  dean: '教务',
  academic: '教务',
  teacher: '讲师',
  lecturer: '讲师',
  assistant: '助教',
  student: '学员',
  guest: '访客',
};

export function Sidebar({
  activeKey,
  onSelect,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  className,
}: SidebarProps) {
  const navigate = useNavigate();
  const { user, canAccess } = useAuthStore();
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? (controlledCollapsed as boolean) : internalCollapsed;

  const toggleCollapsed = React.useCallback(() => {
    const next = !collapsed;
    if (!isControlled) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }, [collapsed, isControlled, onCollapsedChange]);

  const handleItemClick = React.useCallback(
    (item: SidebarMenuItem) => {
      onSelect?.(item.key, item.href);
      if (item.href) {
        navigate(item.href);
      }
    },
    [onSelect, navigate]
  );

  const visibleItems = React.useMemo(() => {
    return menuItems.filter((item) => canAccess(item.allowedRoles));
  }, [canAccess]);

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r border-primary-100 bg-gradient-to-b from-primary-800 via-primary-700 to-primary-800 text-white transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        <div className={cn('flex items-center gap-2.5 overflow-hidden', collapsed && 'justify-center w-full')}>
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-accent-teal to-primary-400 flex items-center justify-center shadow-glow">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-wide">智教云</span>
              <span className="text-[11px] text-primary-200">在线教育平台</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleItemClick(item)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700',
                isActive
                  ? 'bg-gradient-to-r from-white/20 to-white/5 text-white shadow-glow'
                  : 'text-primary-100 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center px-2',
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                  isActive ? 'text-accent-teal' : 'text-primary-200 group-hover:text-white',
                )}
              />
              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent-teal shadow-[0_0_8px_rgba(46,196,182,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-white/10 p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl p-2.5 bg-white/5',
              collapsed && 'justify-center',
            )}
          >
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-accent-teal to-primary-400 flex items-center justify-center text-sm font-semibold">
              {(user.realName || user.name || user.username).charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-sm font-medium truncate">
                  {user.realName || user.name || user.username}
                </span>
                <span className="text-xs text-primary-200 truncate">
                  {roleLabels[user.role]}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleCollapsed}
        className={cn(
          'absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-600 shadow-md transition-all hover:bg-primary-50 hover:text-primary-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        )}
        aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}
