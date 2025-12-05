/**
 * Live Metrics Bar - Barra de métricas em tempo real
 */

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Ship, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Globe,
  Anchor,
  Radio
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveMetric {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  status?: 'success' | 'warning' | 'error';
}

export function LiveMetricsBar() {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    {
      id: 'vessels',
      label: 'Embarcações Ativas',
      value: 47,
      icon: <Ship className="h-3 w-3" />,
      trend: 'stable',
      status: 'success'
    },
    {
      id: 'crew',
      label: 'Tripulantes',
      value: 1284,
      icon: <Users className="h-3 w-3" />,
      trend: 'up',
      status: 'success'
    },
    {
      id: 'alerts',
      label: 'Alertas',
      value: 3,
      icon: <AlertTriangle className="h-3 w-3" />,
      trend: 'down',
      status: 'warning'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      value: '98%',
      icon: <CheckCircle className="h-3 w-3" />,
      trend: 'up',
      status: 'success'
    },
    {
      id: 'operations',
      label: 'Operações Hoje',
      value: 156,
      icon: <Activity className="h-3 w-3" />,
      trend: 'up',
      status: 'success'
    },
    {
      id: 'ports',
      label: 'Portos Ativos',
      value: 12,
      icon: <Anchor className="h-3 w-3" />,
      trend: 'stable',
      status: 'success'
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Simular atualização de métricas
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        if (metric.id === 'alerts') {
          const newValue = Math.max(0, (metric.value as number) + (Math.random() > 0.7 ? 1 : -1));
          return { ...metric, value: newValue };
        }
        if (metric.id === 'operations') {
          return { ...metric, value: (metric.value as number) + Math.floor(Math.random() * 3) };
        }
        return metric;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Rotação automática em mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % metrics.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [metrics.length]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur border-b border-border/50 px-4 py-2">
      {/* Desktop: Show all metrics */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {metrics.map((metric) => (
          <div 
            key={metric.id}
            className="flex items-center gap-2 text-xs"
          >
            <div className={getStatusColor(metric.status)}>
              {metric.icon}
            </div>
            <span className="text-muted-foreground">{metric.label}:</span>
            <span className="font-semibold">{metric.value}</span>
            <span className={`text-[10px] ${
              metric.trend === 'up' ? 'text-green-500' : 
              metric.trend === 'down' ? 'text-red-500' : 
              'text-muted-foreground'
            }`}>
              {getTrendIcon(metric.trend)}
            </span>
          </div>
        ))}
        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
          <Radio className="h-2 w-2 mr-1 animate-pulse" />
          LIVE
        </Badge>
      </div>

      {/* Mobile: Carousel */}
      <div className="md:hidden flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm"
          >
            <div className={getStatusColor(metrics[currentIndex].status)}>
              {metrics[currentIndex].icon}
            </div>
            <span className="text-muted-foreground">{metrics[currentIndex].label}:</span>
            <span className="font-semibold">{metrics[currentIndex].value}</span>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex items-center gap-1">
          {metrics.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1 w-1 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
