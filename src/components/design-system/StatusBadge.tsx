/**
 * StatusBadge - Badge de Status Padronizado
 * Para exibição consistente de status em todo o sistema
 */

import { FC, ReactNode } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  Circle,
  Pause,
  Play,
  Archive,
  Send,
  Eye,
  Ban
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'success' | 'error' | 'warning' | 'info' | 'pending' | 'loading'
  | 'active' | 'inactive' | 'paused' | 'archived'
  | 'draft' | 'submitted' | 'approved' | 'rejected' | 'review'
  | 'custom';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulse?: boolean;
  customColor?: string;
  customIcon?: ReactNode;
  className?: string;
}

const statusConfig: Record<StatusType, {
  label: string;
  icon: typeof CheckCircle2;
  colorClass: string;
  bgClass: string;
}> = {
  success: {
    label: 'Sucesso',
    icon: CheckCircle2,
    colorClass: 'text-success',
    bgClass: 'bg-success/10 border-success/20 text-success',
  },
  error: {
    label: 'Erro',
    icon: XCircle,
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/10 border-destructive/20 text-destructive',
  },
  warning: {
    label: 'Atenção',
    icon: AlertTriangle,
    colorClass: 'text-warning',
    bgClass: 'bg-warning/10 border-warning/20 text-warning',
  },
  info: {
    label: 'Info',
    icon: Circle,
    colorClass: 'text-info',
    bgClass: 'bg-info/10 border-info/20 text-info',
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted border-border text-muted-foreground',
  },
  loading: {
    label: 'Carregando',
    icon: Loader2,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10 border-primary/20 text-primary',
  },
  active: {
    label: 'Ativo',
    icon: Play,
    colorClass: 'text-success',
    bgClass: 'bg-success/10 border-success/20 text-success',
  },
  inactive: {
    label: 'Inativo',
    icon: Circle,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted border-border text-muted-foreground',
  },
  paused: {
    label: 'Pausado',
    icon: Pause,
    colorClass: 'text-warning',
    bgClass: 'bg-warning/10 border-warning/20 text-warning',
  },
  archived: {
    label: 'Arquivado',
    icon: Archive,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted border-border text-muted-foreground',
  },
  draft: {
    label: 'Rascunho',
    icon: Circle,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted border-border text-muted-foreground',
  },
  submitted: {
    label: 'Enviado',
    icon: Send,
    colorClass: 'text-info',
    bgClass: 'bg-info/10 border-info/20 text-info',
  },
  approved: {
    label: 'Aprovado',
    icon: CheckCircle2,
    colorClass: 'text-success',
    bgClass: 'bg-success/10 border-success/20 text-success',
  },
  rejected: {
    label: 'Rejeitado',
    icon: Ban,
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/10 border-destructive/20 text-destructive',
  },
  review: {
    label: 'Em Revisão',
    icon: Eye,
    colorClass: 'text-warning',
    bgClass: 'bg-warning/10 border-warning/20 text-warning',
  },
  custom: {
    label: 'Custom',
    icon: Circle,
    colorClass: '',
    bgClass: '',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const StatusBadge: FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  pulse = false,
  customColor,
  customIcon,
  className,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border',
        sizeClasses[size],
        status === 'custom' ? customColor : config.bgClass,
        className
      )}
    >
      {showIcon && (
        <span className={cn(pulse && 'animate-pulse')}>
          {customIcon || (
            <Icon 
              className={cn(
                iconSizes[size],
                status === 'loading' && 'animate-spin',
                status !== 'custom' && config.colorClass
              )} 
            />
          )}
        </span>
      )}
      {displayLabel}
    </Badge>
  );
};

// Convenience exports
export const SuccessBadge: FC<Omit<StatusBadgeProps, 'status'>> = (props) => (
  <StatusBadge status="success" {...props} />
);

export const ErrorBadge: FC<Omit<StatusBadgeProps, 'status'>> = (props) => (
  <StatusBadge status="error" {...props} />
);

export const WarningBadge: FC<Omit<StatusBadgeProps, 'status'>> = (props) => (
  <StatusBadge status="warning" {...props} />
);

export const PendingBadge: FC<Omit<StatusBadgeProps, 'status'>> = (props) => (
  <StatusBadge status="pending" {...props} />
);

export const ActiveBadge: FC<Omit<StatusBadgeProps, 'status'>> = (props) => (
  <StatusBadge status="active" {...props} />
);

export default StatusBadge;
