import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { BloodGroup, EmergencyPriority, RequestStatus } from '../../types/blood.types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blood' | 'priority' | 'status' | 'neutral' | 'success' | 'warning' | 'danger';
  bloodGroup?: BloodGroup;
  priority?: EmergencyPriority;
  status?: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  bloodGroup,
  priority,
  status,
  size = 'md',
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  let colorStyles = 'bg-slate-100 text-slate-700 border border-slate-200';

  if (bloodGroup) {
    colorStyles = 'bg-brand-50 text-brand-800 border-2 border-brand-200 font-extrabold tracking-wide';
  } else if (priority) {
    switch (priority) {
      case 'CRITICAL':
        colorStyles = 'bg-red-100 text-red-800 border border-red-300 animate-pulse';
        break;
      case 'URGENT':
        colorStyles = 'bg-amber-100 text-amber-900 border border-amber-300';
        break;
      case 'STANDARD':
        colorStyles = 'bg-blue-100 text-blue-900 border border-blue-200';
        break;
    }
  } else if (status) {
    switch (status) {
      case 'ACTIVE':
        colorStyles = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
        break;
      case 'PENDING_VERIFICATION':
        colorStyles = 'bg-amber-100 text-amber-800 border border-amber-300';
        break;
      case 'RESPONSES_RECEIVED':
        colorStyles = 'bg-indigo-100 text-indigo-800 border border-indigo-300';
        break;
      case 'FULFILLED':
        colorStyles = 'bg-emerald-600 text-white border border-emerald-700';
        break;
      case 'CANCELLED':
      case 'EXPIRED':
        colorStyles = 'bg-slate-200 text-slate-700 border border-slate-300';
        break;
      default:
        colorStyles = 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  } else {
    switch (variant) {
      case 'success':
        colorStyles = 'bg-emerald-50 text-emerald-800 border border-emerald-200';
        break;
      case 'warning':
        colorStyles = 'bg-amber-50 text-amber-900 border border-amber-200';
        break;
      case 'danger':
        colorStyles = 'bg-red-50 text-red-800 border border-red-200';
        break;
      case 'neutral':
      default:
        colorStyles = 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full select-none',
          sizeStyles[size],
          colorStyles,
          className
        )
      )}
      {...props}
    >
      {bloodGroup && (
        <span className="w-1.5 h-1.5 rounded-full bg-brand-600 inline-block" />
      )}
      {children || bloodGroup || priority || status}
    </span>
  );
};
