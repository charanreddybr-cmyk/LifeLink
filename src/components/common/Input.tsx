import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-soft-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-red-400 text-red-900 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 hover:border-slate-400',
              className
            )
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-charcoal-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
