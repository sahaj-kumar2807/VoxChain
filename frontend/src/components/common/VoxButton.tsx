import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface VoxButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  children?: React.ReactNode;
  /** primary = white fill, outline = bordered ghost, ghost = text-only, danger, success */
  variant?: 'primary' | 'primary-gold' | 'outline' | 'ghost' | 'danger' | 'success';
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
      variant = 'primary',
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
      'inline-flex items-center justify-center font-mono font-semibold uppercase tracking-wider rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-white text-black font-bold hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_28px_rgba(255,255,255,0.4)] disabled:bg-white/[0.05] disabled:border disabled:border-white/10 disabled:text-zinc-500 disabled:shadow-none',
      'primary-gold':
        'bg-gradient-to-r from-zinc-100 to-zinc-300 hover:from-white hover:to-zinc-200 text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_28px_rgba(255,255,255,0.45)] disabled:opacity-40 disabled:shadow-none',
      outline:
        'bg-white/[0.03] border border-white/15 text-zinc-200 hover:bg-white/[0.08] hover:border-white/35 hover:text-white shadow-sm backdrop-blur-sm disabled:opacity-35 disabled:hover:bg-white/[0.03]',
      ghost:
        'bg-transparent text-zinc-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-35',
      danger:
        'bg-rose-500/10 border border-rose-500/30 text-rose-200 hover:bg-rose-500/20 hover:border-rose-500/60 hover:text-white shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:shadow-[0_0_28px_rgba(244,63,94,0.25)] disabled:bg-rose-500/[0.03] disabled:border-rose-500/15 disabled:text-rose-400/30 disabled:shadow-none',
      success:
        'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_28px_rgba(16,185,129,0.25)] disabled:bg-emerald-500/[0.03] disabled:border-emerald-500/15 disabled:text-emerald-400/30 disabled:shadow-none',
    };

    const sizes = {
      sm: 'text-[10px] px-3 py-1.5 gap-1.5 tracking-[0.12em]',
      md: 'text-[11px] px-4 py-2.5 gap-2 tracking-[0.1em]',
      lg: 'text-xs px-6 py-3 gap-2.5 tracking-[0.1em]',
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={disabled || isLoading ? undefined : { scale: 1.015 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-current shrink-0" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

VoxButton.displayName = 'VoxButton';
