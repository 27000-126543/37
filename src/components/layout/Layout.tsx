import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar, menuItems } from './Sidebar';
import { Header, type BreadcrumbItem } from './Header';

export interface LayoutProps {
  children?: React.ReactNode;
  activeKey?: string;
  breadcrumbs?: BreadcrumbItem[];
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  onMenuSelect?: (key: string, href?: string) => void;
  className?: string;
}

export function Layout({
  children,
  activeKey,
  breadcrumbs,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  onMenuSelect,
  className,
}: LayoutProps) {
  const location = useLocation();
  const computedActiveKey = React.useMemo(() => {
    if (activeKey) return activeKey;
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/courses')) return 'courses';
    if (path.startsWith('/live')) return 'live';
    if (path.startsWith('/assignments')) return 'assignments';
    if (path.startsWith('/exams')) return 'exams';
    if (path.startsWith('/certificates')) return 'certificates';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/teachers')) return 'teacher-review';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/users')) return 'users';
    return 'dashboard';
  }, [activeKey, location.pathname]);
  const defaultBreadcrumbs: BreadcrumbItem[] = React.useMemo(() => {
    if (breadcrumbs) return breadcrumbs;
    const item = menuItems.find((m) => m.key === computedActiveKey);
    if (item) {
      return [{ label: item.label, icon: item.icon }];
    }
    return [];
  }, [computedActiveKey, breadcrumbs]);

  const handleMenuSelect = React.useCallback(
    (key: string, href?: string) => {
      if (onMenuSelect) {
        onMenuSelect(key, href);
      }
    },
    [onMenuSelect],
  );

  return (
    <div className={cn('flex min-h-screen bg-gradient-to-br from-surface-light via-white to-primary-50/30 dark:from-surface-darker dark:via-surface-dark dark:to-surface-darker', className)}>
      <Sidebar
        activeKey={computedActiveKey}
        collapsed={sidebarCollapsed}
        onCollapsedChange={onSidebarCollapsedChange}
        onSelect={handleMenuSelect}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Header breadcrumbs={defaultBreadcrumbs} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
