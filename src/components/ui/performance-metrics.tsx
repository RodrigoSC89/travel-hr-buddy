import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  Zap,
  Droplets,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MetricData {
  id: string;
  label: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  color: string;
}

const mockMetrics: MetricData[] = [
  {
    id: 'efficiency',
    label: 'Eficiência Operacional',
    value: 94.2,
    unit: '%',
    target: 90,
    trend: 'up',
    trendValue: 2.1,
    status: 'excellent',
    icon: Target,
    color: 'text-success'
  },
  {
    id: 'fuel_efficiency',
    label: 'Eficiência Combustível',
    value: 87.5,
    unit: '%',
    target: 85,
    trend: 'down',
    trendValue: -1.2,
    status: 'good',
    icon: Droplets,
    color: 'text-info'
  },
  {
    id: 'uptime',
    label: 'Tempo Operacional',
    value: 98.7,
    unit: '%',
    target: 95,
    trend: 'up',
    trendValue: 0.8,
    status: 'excellent',
    icon: Clock,
    color: 'text-success'
  },
  {
    id: 'power_efficiency',
    label: 'Eficiência Energética',
    value: 82.3,
    unit: '%',
    target: 85,
    trend: 'down',
    trendValue: -2.5,
    status: 'warning',
    icon: Zap,
    color: 'text-warning'
  },
  {
    id: 'compliance',
    label: 'Compliance Score',
    value: 96.8,
    unit: '%',
    target: 95,
    trend: 'up',
    trendValue: 1.5,
    status: 'excellent',
    icon: Award,
    color: 'text-success'
  },
  {
    id: 'incidents',
    label: 'Incidentes (Mês)',
    value: 2,
    unit: '',
    target: 0,
    trend: 'up',
    trendValue: 1,
    status: 'critical',
    icon: AlertTriangle,
    color: 'text-danger'
  }
];

const statusColors = {
  excellent: 'border-success bg-success/5',
  good: 'border-info bg-info/5',
  warning: 'border-warning bg-warning/5',
  critical: 'border-danger bg-danger/5'
};

const statusLabels = {
  excellent: 'Excelente',
  good: 'Bom',
  warning: 'Atenção',
  critical: 'Crítico'
};

interface PerformanceMetricsProps {
  className?: string;
  compact?: boolean;
}

export const PerformanceMetrics = ({ className, compact = false }: PerformanceMetricsProps) => {
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('24h');

  // Simular updates em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const variation = (Math.random() - 0.5) * 2; // -1 a +1
        let newValue = metric.value;
        
        switch (metric.id) {
          case 'efficiency':
          case 'fuel_efficiency':
          case 'uptime':
          case 'power_efficiency':
          case 'compliance':
            newValue = Math.max(0, Math.min(100, metric.value + variation * 0.5));
            break;
          case 'incidents':
            newValue = Math.max(0, metric.value + (Math.random() > 0.8 ? 1 : 0));
            break;
        }
        
        // Determinar status baseado no valor e target
        let newStatus = metric.status;
        if (metric.id === 'incidents') {
          if (newValue === 0) newStatus = 'excellent';
          else if (newValue <= 1) newStatus = 'good';
          else if (newValue <= 3) newStatus = 'warning';
          else newStatus = 'critical';
        } else {
          const percentage = (newValue / metric.target) * 100;
          if (percentage >= 105) newStatus = 'excellent';
          else if (percentage >= 95) newStatus = 'good';
          else if (percentage >= 85) newStatus = 'warning';
          else newStatus = 'critical';
        }
        
        return {
          ...metric,
          value: Number(newValue.toFixed(1)),
          status: newStatus
        };
      }));
    }, 5000); // Update a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const getPerformanceScore = () => {
    const scores = metrics.map(metric => {
      if (metric.id === 'incidents') {
        return metric.value === 0 ? 100 : Math.max(0, 100 - (metric.value * 20));
      }
      return (metric.value / metric.target) * 100;
    });
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const overallScore = getPerformanceScore();
  const getScoreStatus = (score: number) => {
    if (score >= 95) return 'excellent';
    if (score >= 85) return 'good';
    if (score >= 75) return 'warning';
    return 'critical';
  };

  if (compact) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Performance Geral</h3>
            <p className="text-sm text-muted-foreground">Métricas consolidadas</p>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-3xl font-bold",
              getScoreStatus(overallScore) === 'excellent' && "text-success",
              getScoreStatus(overallScore) === 'good' && "text-info",
              getScoreStatus(overallScore) === 'warning' && "text-warning",
              getScoreStatus(overallScore) === 'critical' && "text-danger"
            )}>
              {overallScore}%
            </div>
            <p className="text-sm text-muted-foreground">
              {statusLabels[getScoreStatus(overallScore)]}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {metrics.slice(0, 4).map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.id} className="flex items-center space-x-3">
                <Icon className={cn("flex-shrink-0", metric.color)} size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{metric.label}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">
                      {metric.value}{metric.unit}
                    </span>
                    <div className={cn(
                      "flex items-center text-xs",
                      metric.trend === 'up' ? "text-success" : "text-danger"
                    )}>
                      {metric.trend === 'up' ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      <span className="ml-1">{Math.abs(metric.trendValue)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Métricas de Performance</h2>
          <p className="text-muted-foreground">Monitoramento em tempo real</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {['24h', '7d', '30d'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as any)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                selectedPeriod === period
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent hover:bg-accent/80"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Score */}
      <Card className="p-6">
        <div className="text-center">
          <div className={cn(
            "text-6xl font-bold mb-2",
            getScoreStatus(overallScore) === 'excellent' && "text-success",
            getScoreStatus(overallScore) === 'good' && "text-info",
            getScoreStatus(overallScore) === 'warning' && "text-warning",
            getScoreStatus(overallScore) === 'critical' && "text-danger"
          )}>
            {overallScore}%
          </div>
          <h3 className="text-xl font-semibold mb-1">Performance Geral</h3>
          <p className="text-muted-foreground">
            Status: {statusLabels[getScoreStatus(overallScore)]}
          </p>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isTarget = metric.value >= metric.target || (metric.id === 'incidents' && metric.value <= metric.target);
          
          return (
            <Card 
              key={metric.id} 
              className={cn(
                "p-6 transition-all duration-200 hover:shadow-wave",
                statusColors[metric.status]
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-lg",
                  `bg-${metric.color.split('-')[1]}/10`
                )}>
                  <Icon className={metric.color} size={24} />
                </div>
                <div className={cn(
                  "flex items-center text-sm font-medium",
                  metric.trend === 'up' && metric.id !== 'incidents' ? "text-success" : 
                  metric.trend === 'down' && metric.id !== 'incidents' ? "text-danger" :
                  metric.trend === 'up' && metric.id === 'incidents' ? "text-danger" : "text-success"
                )}>
                  {metric.trend === 'up' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span className="ml-1">{Math.abs(metric.trendValue)}%</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">{metric.label}</h4>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">
                    {metric.value}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    {metric.unit}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Meta: {metric.target}{metric.unit}</span>
                  <span className={cn(
                    "font-medium",
                    isTarget ? "text-success" : "text-danger"
                  )}>
                    {isTarget ? '✓ Atingida' : '⚠ Abaixo'}
                  </span>
                </div>
                
                <div className="w-full bg-accent rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      metric.status === 'excellent' && "bg-success",
                      metric.status === 'good' && "bg-info",
                      metric.status === 'warning' && "bg-warning",
                      metric.status === 'critical' && "bg-danger"
                    )}
                    style={{ 
                      width: metric.id === 'incidents' 
                        ? `${Math.max(10, Math.min(100, (5 - metric.value) * 20))}%`
                        : `${Math.min(100, (metric.value / metric.target) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};