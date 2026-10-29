import React from 'react';
import { cn } from '../../utils/cn';

export interface VoxCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'layer-1' | 'layer-2' | 'interactive' | 'active';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const VoxCard = React.forwardRef<HTMLDivElement, VoxCardProps>(
  ({ className, variant = 'layer-2', padding = 'md', children, ...props }, ref) => {
    const variants = {
      'layer-1':
        'bg-gradient-to-b from-[#111216]/95 to-[#090A0D]/98 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl',
      'layer-2':
        'bg-gradient-to-b from-[#15161C]/95 to-[#0B0C10]/98 border border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_48px_rgba(0,0,0,0.8)] backdrop-blur-xl',
      interactive:
        'bg-gradient-to-b from-[#121318]/95 to-[#0A0B0E]/98 border border-white/10 hover:border-white/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_40px_rgba(0,0,0,0.7)] hover:shadow-[0_20px_48px_rgba(255,255,255,0.06)] backdrop-blur-xl',
      active:
        'bg-gradient-to-b from-[#171820]/95 to-[#0E0F14] border border-white/30 shadow-[0_0_24px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/20',
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
