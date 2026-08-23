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
    info: <Info className="w-5 h-5 text-vox-state-info shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-vox-state-success shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-vox-state-warning shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-vox-state-danger shrink-0" />,
  };

  const variants = {
    info: 'bg-vox-state-info-bg border-vox-state-info/30 text-vox-text-primary',
    success: 'bg-vox-state-success-bg border-vox-state-success/30 text-vox-text-primary',
    warning: 'bg-vox-state-warning-bg border-vox-state-warning/30 text-vox-text-primary',
    danger: 'bg-vox-state-danger-bg border-vox-state-danger/30 text-vox-text-primary',
  };

  return (
    <div
      className={cn('flex items-start gap-3 p-4 rounded-lg border text-sm', variants[variant], className)}
      role="alert"
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5 font-sans">{title}</h5>}
        <div className="text-xs text-vox-text-secondary leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
