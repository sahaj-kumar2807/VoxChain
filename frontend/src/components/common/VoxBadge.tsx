import React from 'react';
import { cn } from '../../utils/cn';

export interface VoxBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'silver';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const VoxBadge: React.FC<VoxBadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-md select-none';

  const variants = {
    neutral: 'bg-white/[0.04] text-zinc-300 border border-white/10 shadow-sm',
    silver:  'bg-white/[0.08] text-white border border-white/20 shadow-sm',
    gold:    'bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.12)]',
    success: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/25',
    danger:  'bg-rose-500/10 text-rose-300 border border-rose-500/25 shadow-[0_0_12px_rgba(244,63,94,0.12)]',
    info:    'bg-sky-500/10 text-sky-300 border border-sky-500/25 shadow-[0_0_12px_rgba(14,165,233,0.12)]',
  };

  const dotColors = {
    neutral: 'bg-zinc-400',
    silver:  'bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]',
    gold:    'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]',
    success: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]',
    warning: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]',
    danger:  'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.7)]',
    info:    'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]',
  };

  const sizes = {
    sm: 'text-[9px] px-2 py-0.5 gap-1',
    md: 'text-[10px] px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-dot', dotColors[variant])}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
