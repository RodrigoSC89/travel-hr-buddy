import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  className?: string;
}

const alertStyles = {
  success: {
    container: 'bg-success/10 border-success/20',
    icon: 'text-success',
    title: 'text-success-foreground',
    message: 'text-success-foreground/80',
    Icon: CheckCircle2,
  },
  error: {
    container: 'bg-danger/10 border-danger/20',
    icon: 'text-danger',
    title: 'text-danger-foreground',
    message: 'text-danger-foreground/80',
    Icon: XCircle,
  },
  warning: {
    container: 'bg-warning/10 border-warning/20',
    icon: 'text-warning',
    title: 'text-warning-foreground',
    message: 'text-warning-foreground/80',
    Icon: AlertCircle,
  },
  info: {
    container: 'bg-info/10 border-info/20',
    icon: 'text-info',
    title: 'text-info-foreground',
    message: 'text-info-foreground/80',
    Icon: Info,
  },
};

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  title,
  message,
  className,
}) => {
  const styles = alertStyles[type];
  const IconComponent = styles.Icon;

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-4 transition-all',
        styles.container,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />
        <div className="flex-1 space-y-1">
          {title && (
            <p className={cn('text-sm font-semibold', styles.title)}>{title}</p>
          )}
          <p className={cn('text-sm', styles.message)}>{message}</p>
        </div>
      </div>
    </div>
  );
};
