import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  gradient?: boolean;
  size?: 'sm' | 'md' | 'lg';
  indicator?: string;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const labelSizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm font-medium',
};

export function Progress({
  className,
  value,
  max = 100,
  showLabel = false,
  gradient = true,
  size = 'md',
  indicator,
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn('relative w-full flex flex-col gap-1.5', className)}
      {...props}
    >
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn('text-primary-600', labelSizeStyles[size])}>
            {indicator || '进度'}
          </span>
          <span className={cn('font-semibold text-primary-800', labelSizeStyles[size])}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'w-full overflow-hidden rounded-full bg-primary-100',
          sizeStyles[size],
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            gradient
              ? 'bg-gradient-to-r from-primary-500 via-primary-400 to-accent-teal'
              : 'bg-gradient-primary',
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
