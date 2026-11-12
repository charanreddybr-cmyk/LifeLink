import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
  padded?: boolean;
  accent?: 'none' | 'brand' | 'critical' | 'emerald';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  bordered = true,
  padded = true,
  accent = 'none',
  className,
  ...props
}) => {
  const accentStyles = {
    none: '',
    brand: 'border-t-4 border-t-brand-600',
    critical: 'border-t-4 border-t-red-600 shadow-emergency',
    emerald: 'border-t-4 border-t-emerald-600',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl transition-all duration-200',
          bordered && 'border border-slate-200/80',
          hoverable && 'hover:shadow-soft-md hover:border-slate-300 transform-gpu',
          !hoverable && 'shadow-soft-sm',
          padded && 'p-6',
          accentStyles[accent],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
