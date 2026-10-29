import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface VoxAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
}

export const VoxAlert: React.FC<VoxAlertProps> = ({
  className,
  variant = 'info',
  title,
  children,
  ...props
}) => {
  const icons = {
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    danger: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  };

  const variants = {
    info: 'bg-sky-500/[0.05] border-sky-500/25 text-zinc-200 shadow-[inset_0_1px_0_rgba(56,189,248,0.1)]',
    success: 'bg-emerald-500/[0.05] border-emerald-500/25 text-zinc-200 shadow-[inset_0_1px_0_rgba(52,211,153,0.1)]',
    warning: 'bg-amber-500/[0.05] border-amber-500/25 text-zinc-200 shadow-[inset_0_1px_0_rgba(251,191,36,0.1)]',
    danger: 'bg-rose-500/[0.05] border-rose-500/25 text-zinc-200 shadow-[inset_0_1px_0_rgba(244,63,94,0.1)]',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3.5 p-4 rounded-xl border backdrop-blur-md text-sm',
        variants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/08 flex items-center justify-center shrink-0 mt-0.5">
        {icons[variant]}
      </div>
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-semibold text-white text-xs font-mono uppercase tracking-wider mb-1">{title}</h5>}
        <div className="text-xs text-zinc-300 font-sans leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
