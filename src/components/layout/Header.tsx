import * as React from 'react';
import {
  ChevronRight,
  Home,
  User,
  LogOut,
  Shield,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'admin', label: '管理员' },
  { value: 'dean', label: '教务' },
  { value: 'teacher', label: '讲师' },
  { value: 'assistant', label: '助教' },
  { value: 'student', label: '学员' },
];

export function Header({ breadcrumbs = [], className }: HeaderProps) {
  const { user, logout, switchRole } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const roleMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.realName || user?.name || user?.username || '未登录';
  const currentRoleLabel = user ? roleOptions.find((r) => r.value === user.role)?.label || user.role : '';

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between gap-4 border-b border-primary-100 bg-white/80 backdrop-blur-sm px-6',
        className,
      )}
    >
      <nav aria-label="面包屑" className="flex items-center gap-2 text-sm">
        <button
          type="button"
          className="flex items-center gap-1.5 text-primary-500 hover:text-primary-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">首页</span>
        </button>
        {breadcrumbs.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="h-3.5 w-3.5 text-primary-300" />
              {item.href && !isLast ? (
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-primary-500 hover:text-primary-700 transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </button>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    isLast ? 'text-primary-800 font-semibold' : 'text-primary-500',
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        {user && (
          <div className="relative" ref={roleMenuRef}>
            <button
              type="button"
              onClick={() => {
                setRoleMenuOpen((prev) => !prev);
                setUserMenuOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 py-1.5 text-sm font-medium text-primary-700 transition-all hover:border-primary-300 hover:bg-primary-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
              )}
            >
              <Shield className="h-4 w-4 text-primary-500" />
              <span>{currentRoleLabel}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-primary-400 transition-transform',
                  roleMenuOpen && 'rotate-180',
                )}
              />
            </button>
            {roleMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-36 rounded-xl border border-primary-100 bg-white py-1 shadow-card-hover">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => {
                      switchRole(role.value);
                      setRoleMenuOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                      user.role === role.value
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-primary-600 hover:bg-primary-50',
                    )}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    {role.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary-100 text-primary-500 transition-all hover:bg-primary-50 hover:text-primary-700"
          aria-label="通知"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-orange text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen((prev) => !prev);
                setRoleMenuOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-xl p-1 pr-2 transition-all hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-sm font-semibold text-white shadow-glow">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-primary-800 leading-tight">
                  {displayName}
                </span>
                <span className="text-xs text-primary-500">
                  {user.email || user.username}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-primary-400 hidden sm:block transition-transform',
                  userMenuOpen && 'rotate-180',
                )}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-primary-100 bg-white py-1.5 shadow-card-hover">
                <div className="border-b border-primary-100 px-3 py-2.5">
                  <p className="text-sm font-medium text-primary-800">{displayName}</p>
                  <p className="text-xs text-primary-500 truncate">
                    {user.email || user.username}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    window.location.hash = '#/profile';
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-primary-700 transition-colors hover:bg-primary-50"
                >
                  <User className="h-4 w-4" />
                  个人中心
                </button>
                <div className="my-1 border-t border-primary-50" />
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
