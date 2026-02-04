/**
 * Interactive KPI Card Component
 * Card de KPI interativo com drill-down e animações
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  ExternalLink, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIDetail {
  label: string;
  value: string | number;
  change?: number;
}

interface InteractiveKPICardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  format?: 'number' | 'currency' | 'percent';
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  progress?: number;
  details?: KPIDetail[];
  onDrillDown?: () => void;
  drillDownLabel?: string;
  className?: string;
}

export const InteractiveKPICard: React.FC<InteractiveKPICardProps> = ({
  title,
  value,
  previousValue,
  change,
  changeLabel = 'vs período anterior',
  icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  format = 'number',
  status = 'neutral',
  progress,
  details,
  onDrillDown,
  drillDownLabel = 'Ver detalhes',
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('pt-BR');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'border-l-green-500';
      case 'warning': return 'border-l-yellow-500';
      case 'danger': return 'border-l-red-500';
      case 'info': return 'border-l-blue-500';
      default: return 'border-l-muted-foreground/30';
    }
  };

  const getTrendIcon = () => {
    if (!change) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden border-l-4 cursor-pointer hover:shadow-lg transition-all duration-300",
          getStatusColor(),
          className
        )}
        onClick={() => details && setIsExpanded(!isExpanded)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                {details && (
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                )}
              </div>
              <motion.div 
                className="text-3xl font-bold"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                {formatValue(value)}
              </motion.div>
              
              {change !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  {getTrendIcon()}
                  <span className={cn(
                    "text-sm font-medium",
                    change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                </div>
              )}

              {progress !== undefined && (
                <div className="mt-3">
                  <Progress value={progress} className="h-2" />
                  <span className="text-xs text-muted-foreground mt-1">{progress}% do objetivo</span>
                </div>
              )}
            </div>

            <div className={cn("p-3 rounded-xl", iconBg)}>
              <div className={iconColor}>{icon}</div>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && details && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-border/50"
              >
                <div className="space-y-2">
                  {details.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{detail.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{detail.value}</span>
                        {detail.change !== undefined && (
                          <Badge variant={detail.change >= 0 ? "default" : "destructive"} className="text-xs">
                            {detail.change > 0 ? '+' : ''}{detail.change}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {onDrillDown && (
                  <Button 
                    variant="link" 
                    className="mt-3 p-0 h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrillDown();
                    }}
                  >
                    {drillDownLabel}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InteractiveKPICard;
