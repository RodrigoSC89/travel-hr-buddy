/**
 * MetricsHolograph Component
 * Floating 3D KPI metrics display
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Ship, Users, FileCheck } from 'lucide-react';
import type { KPIMetric3D } from './types';

interface MetricsHolographProps {
  metrics: KPIMetric3D[];
  onMetricClick?: (metric: KPIMetric3D) => void;
}

const iconMap: Record<string, React.ElementType> = {
  vessels: Ship,
  crew: Users,
  compliance: FileCheck,
  alerts: AlertTriangle,
};

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-green-400" />;
    case 'down':
      return <TrendingDown className="h-3 w-3 text-red-400" />;
    default:
      return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
}

export function MetricsHolograph({ metrics, onMetricClick }: MetricsHolographProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((metric, index) => {
        const Icon = iconMap[metric.id] || AlertTriangle;
        
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            onClick={() => onMetricClick?.(metric)}
            className="relative group cursor-pointer"
          >
            {/* Holographic glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Card content */}
            <div className="relative bg-background/60 backdrop-blur-md border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-all">
              {/* Scan line effect */}
              <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                <motion.div
                  className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                  animate={{ y: [0, 100, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4 text-primary" />
                <div className="flex items-center gap-1">
                  <TrendIcon trend={metric.trend} />
                  {metric.trendValue && (
                    <span className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-400' : 
                      metric.trend === 'down' ? 'text-red-400' : 
                      'text-muted-foreground'
                    }`}>
                      {metric.trend === 'up' ? '+' : ''}{metric.trendValue}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground font-mono">
                  {metric.value.toLocaleString()}
                  <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>
                </div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
              
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/50" />
              <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-primary/50" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-primary/50" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/50" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
