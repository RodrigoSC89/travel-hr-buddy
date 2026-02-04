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

interface ActionableAlertProps {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp?: Date;
  source?: string;
  actions?: AlertAction[];
  onDismiss?: (id: string) => void;
  className?: string;
}

export const ActionableAlert: React.FC<ActionableAlertProps> = ({
  id,
  title,
  message,
  severity,
  timestamp,
  source,
  actions = [],
  onDismiss,
  className
}) => {
  const getSeverityConfig = () => {
    switch (severity) {
      case 'critical':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bg: 'bg-red-500/10 border-red-500/30',
          iconColor: 'text-red-500',
          badgeClass: 'bg-red-500 text-white'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bg: 'bg-yellow-500/10 border-yellow-500/30',
          iconColor: 'text-yellow-500',
          badgeClass: 'bg-yellow-500 text-black'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bg: 'bg-green-500/10 border-green-500/30',
          iconColor: 'text-green-500',
          badgeClass: 'bg-green-500 text-white'
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          bg: 'bg-blue-500/10 border-blue-500/30',
          iconColor: 'text-blue-500',
          badgeClass: 'bg-blue-500 text-white'
        };
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
                      {severity === 'critical' ? 'Crítico' : 
                       severity === 'warning' ? 'Atenção' :
                       severity === 'success' ? 'Sucesso' : 'Info'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{message}</p>
                </div>
                
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => onDismiss(id)}
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
                  {source && <span>• {source}</span>}
                </div>

                {actions.length > 0 && (
                  <div className="flex gap-2">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
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
  className?: string;
}> = ({ alerts, onDismiss, maxVisible = 5, className }) => {
  const visibleAlerts = alerts.slice(0, maxVisible);

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
