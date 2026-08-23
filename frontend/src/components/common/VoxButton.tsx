import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface VoxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary-gold' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const VoxButton = React.forwardRef<HTMLButtonElement, VoxButtonProps>(
  (
    {
      className,
      variant = 'primary-gold',
      size = 'md',
      isLoading = false,
      loadingText,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-semibold rounded-md transition-all duration-150 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vox-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-vox-bg-base disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer select-none';

    const variants = {
      'primary-gold':
        'bg-gradient-to-br from-amber-500 to-amber-600 text-vox-bg-base font-bold shadow-md hover:brightness-110 hover:shadow-vox-active active:brightness-95',
      outline:
        'bg-transparent border border-vox-border-medium text-vox-text-primary hover:bg-vox-surface-2 hover:border-vox-border-strong hover:text-white',
      ghost:
        'bg-transparent text-vox-text-secondary hover:bg-vox-surface-2 hover:text-vox-text-primary',
      danger:
        'bg-vox-state-danger/15 border border-vox-state-danger/40 text-vox-state-danger hover:bg-vox-state-danger/25 hover:border-vox-state-danger',
      success:
        'bg-vox-state-success/15 border border-vox-state-success/40 text-vox-state-success hover:bg-vox-state-success/25 hover:border-vox-state-success',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

VoxButton.displayName = 'VoxButton';
