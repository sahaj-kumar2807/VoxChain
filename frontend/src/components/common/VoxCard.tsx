import React from 'react';
import { cn } from '../../utils/cn';

export interface VoxCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'layer-1' | 'layer-2' | 'interactive' | 'active';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const VoxCard = React.forwardRef<HTMLDivElement, VoxCardProps>(
  ({ className, variant = 'layer-2', padding = 'md', children, ...props }, ref) => {
    const variants = {
      'layer-1': 'bg-vox-surface-1 border border-vox-border-subtle shadow-vox-card',
      'layer-2': 'bg-vox-surface-2 border border-vox-border-medium shadow-vox-card',
      interactive:
        'bg-vox-surface-1 hover:bg-vox-surface-2 border border-vox-border-subtle hover:border-vox-border-medium hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-vox-card',
      active:
        'bg-vox-surface-2 border border-vox-accent-gold/60 shadow-vox-active ring-1 ring-vox-accent-gold/40',
    };

    const paddings = {
      none: '',
      sm: 'p-3.5',
      md: 'p-5',
      lg: 'p-7',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-xl transition-colors', variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

VoxCard.displayName = 'VoxCard';
