import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-primary-500 text-white border-primary-600',
    secondary:
      'bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-800 dark:text-primary-100 dark:border-primary-700',
    success: 'bg-accent-teal/15 text-accent-teal border-accent-teal/30',
    warning: 'bg-accent-yellow/15 text-yellow-700 border-accent-yellow/30',
    danger: 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
    outline: 'border-primary-300 text-primary-700 dark:border-primary-600 dark:text-primary-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
