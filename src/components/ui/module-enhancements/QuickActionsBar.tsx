/**
 * Quick Actions Bar Component
 * Barra de ações rápidas para módulos
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  badge?: string | number;
  disabled?: boolean;
  tooltip?: string;
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  onActionClick?: (actionId: string) => void;
  title?: string;
  className?: string;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  actions,
  onActionClick,
  title = "Ações Rápidas",
  className
}) => {
  if (actions.length === 0) return null;

  const handleClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (onActionClick) {
      onActionClick(action.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => handleClick(action)}
                  disabled={action.disabled}
                  className={cn(
                    "relative gap-2",
                    action.badge && typeof action.badge === 'number' && action.badge > 0 && "pr-8"
                  )}
                  title={action.tooltip}
                >
                  {action.icon}
                  {action.label}
                  {action.badge && typeof action.badge === 'number' && action.badge > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center text-xs"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickActionsBar;
