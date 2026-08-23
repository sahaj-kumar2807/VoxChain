import React from 'react';
import { cn } from '../../utils/cn';

export interface VoxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const VoxInput = React.forwardRef<HTMLInputElement, VoxInputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-mono font-semibold uppercase tracking-wider text-vox-text-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-vox-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-vox-surface-1 border border-vox-border-medium rounded-md px-3.5 py-2.5 text-sm text-vox-text-primary placeholder:text-vox-text-muted focus:outline-none focus:border-vox-accent-gold focus:ring-1 focus:ring-vox-accent-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-vox-state-danger focus:border-vox-state-danger focus:ring-vox-state-danger',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-vox-text-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-vox-state-danger font-sans">{error}</p>}
        {hint && !error && <p className="text-xs text-vox-text-muted font-sans">{hint}</p>}
      </div>
    );
  }
);

VoxInput.displayName = 'VoxInput';
