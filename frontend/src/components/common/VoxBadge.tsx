import React from 'react';
import { cn } from '../../utils/cn';

export interface VoxBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'gold';
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
  const baseStyles = 'inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-sm select-none';

  const variants = {
    neutral: 'bg-vox-surface-3 text-vox-text-secondary border border-vox-border-subtle',
    success: 'bg-vox-state-success-bg text-vox-state-success border border-vox-state-success/30',
    warning: 'bg-vox-state-warning-bg text-vox-state-warning border border-vox-state-warning/30',
    danger: 'bg-vox-state-danger-bg text-vox-state-danger border border-vox-state-danger/30',
    info: 'bg-vox-state-info-bg text-vox-state-info border border-vox-state-info/30',
    gold: 'bg-vox-accent-gold-glow text-vox-accent-gold border border-vox-accent-gold/40',
  };

  const dotColors = {
    neutral: 'bg-vox-text-muted',
    success: 'bg-vox-state-success shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    warning: 'bg-vox-state-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    danger: 'bg-vox-state-danger shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    info: 'bg-vox-state-info shadow-[0_0_8px_rgba(14,165,233,0.8)]',
    gold: 'bg-vox-accent-gold shadow-[0_0_8px_rgba(245,158,11,0.8)]',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />}
      <span>{children}</span>
    </span>
  );
};
