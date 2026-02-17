/**
 * Actionable Alert Component
 * Alertas com ações diretas para resolução rápida
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, AlertCircle, CheckCircle, Info, X,
  Clock, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export interface ActionableAlertProps {
  id: string;
  title: string;
  message?: string;
  description?: string;
  severity: 'critical' | 'high' | 'warning' | 'medium' | 'info' | 'success';
  timestamp?: Date;
  source?: string;
  module?: string;
  actions?: AlertAction[];
  onDismiss?: (id: string) => void;
  className?: string;
}

export const ActionableAlert: React.FC<ActionableAlertProps> = ({
  id,
  title,
  message,
  description,
  severity,
  timestamp,
  source,
  module,
  actions = [],
  onDismiss,
  className
}) => {
  const displayMessage = message || description || '';
  const displaySource = source || module;

  const getSeverityConfig = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bg: 'bg-destructive/10 border-destructive/30',
          iconColor: 'text-destructive',
          badgeClass: 'bg-destructive text-destructive-foreground'
        };
      case 'warning':
      case 'medium':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bg: 'bg-warning/10 border-warning/30',
          iconColor: 'text-warning',
          badgeClass: 'bg-warning text-warning-foreground'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bg: 'bg-success/10 border-success/30',
          iconColor: 'text-success',
          badgeClass: 'bg-success text-success-foreground'
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          bg: 'bg-info/10 border-info/30',
          iconColor: 'text-info',
          badgeClass: 'bg-info text-info-foreground'
        };
    }
  };

  const getSeverityLabel = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'Crítico';
      case 'warning':
      case 'medium':
        return 'Atenção';
      case 'success':
        return 'Sucesso';
      default:
        return 'Info';
    }
  };

  const config = getSeverityConfig();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
    >
      <Card className={cn(
        "border overflow-hidden",
        config.bg,
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg bg-background/50", config.iconColor)}>
              {config.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{title}</h4>
                    <Badge className={cn("text-xs", config.badgeClass)}>
                      {getSeverityLabel()}
                    </Badge>
                  </div>
                  {displayMessage && (
                    <p className="text-sm text-muted-foreground">{displayMessage}</p>
                  )}
                </div>
                
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => onDismiss(id)}
                    aria-label="Dispensar alerta"
                    title="Dispensar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {timestamp && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(timestamp, { addSuffix: true, locale: ptBR })}
                    </span>
                  )}
                  {displaySource && <span>• {displaySource}</span>}
                </div>

                {actions.length > 0 && (
                  <div className="flex gap-2">
                    {actions.map((action) => (
                      <Button
                        key={action.label}
                        variant={action.variant || 'default'}
                        size="sm"
                        onClick={action.onClick}
                        className="h-7 text-xs"
                      >
                        {action.label}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ActionableAlertList: React.FC<{
  alerts: ActionableAlertProps[];
  onDismiss?: (id: string) => void;
  maxVisible?: number;
  emptyMessage?: string;
  className?: string;
}> = ({ alerts, onDismiss, maxVisible = 5, emptyMessage = "Nenhum alerta pendente.", className }) => {
  const visibleAlerts = alerts.slice(0, maxVisible);

  if (alerts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
          <p>{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <AnimatePresence mode="popLayout">
        {visibleAlerts.map((alert) => (
          <ActionableAlert key={alert.id} {...alert} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
      
      {alerts.length > maxVisible && (
        <div className="text-center">
          <Button variant="ghost" size="sm">
            Ver mais {alerts.length - maxVisible} alertas
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActionableAlert;
