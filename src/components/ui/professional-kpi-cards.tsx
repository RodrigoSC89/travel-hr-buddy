import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Activity, 
  Target,
  Award,
  Building2,
  Calendar,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Globe,
  Ship,
  Anchor
} from 'lucide-react';

const ProfessionalKPICards = () => {
  const kpiData = [
    {
      title: 'Receita Operacional',
      value: 'R$ 2.45M',
      change: '+12.5%',
      trend: 'up',
      subtitle: 'Meta: R$ 3.0M',
      progress: 81.7,
      icon: DollarSign,
      color: 'green',
      details: {
        previous: 'R$ 2.18M',
        forecast: 'R$ 2.85M',
        target: 'R$ 3.0M'
      }
    },
    {
      title: 'Eficiência da Frota',
      value: '94.2%',
      change: '+2.8%',
      trend: 'up',
      subtitle: 'Meta: 95%',
      progress: 94.2,
      icon: Ship,
      color: 'blue',
      details: {
        fuel: '92.1%',
        utilization: '87.3%',
        maintenance: '96.8%'
      }
    },
    {
      title: 'Equipe Ativa',
      value: '125',
      change: '+4.2%',
      trend: 'up',
      subtitle: '118 Ativos',
      progress: 94.4,
      icon: Users,
      color: 'purple',
      details: {
        active: 118,
        onLeave: 7,
        contractors: 15
      }
    },
    {
      title: 'Score de Segurança',
      value: '98.5%',
      change: '+1.2%',
      trend: 'up',
      subtitle: 'Excelente',
      progress: 98.5,
      icon: Award,
      color: 'orange',
      details: {
        incidents: 0,
        compliance: '99.2%',
        training: '96.8%'
      }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: {
        bg: 'from-background to-green-50/30',
        icon: 'from-emerald-600 to-green-700',
        text: 'text-emerald-800 dark:text-emerald-700',
        progress: 'bg-emerald-200',
        border: 'border-emerald-300'
      },
      blue: {
        bg: 'from-background to-blue-50/30',
        icon: 'from-azure-600 to-azure-700',
        text: 'text-azure-900 dark:text-azure-800',
        progress: 'bg-azure-200',
        border: 'border-azure-300'
      },
      purple: {
        bg: 'from-background to-purple-50/30',
        icon: 'from-purple-600 to-violet-700',
        text: 'text-purple-900 dark:text-purple-800',
        progress: 'bg-purple-200',
        border: 'border-purple-300'
      },
      orange: {
        bg: 'from-background to-orange-50/30',
        icon: 'from-orange-600 to-amber-700',
        text: 'text-orange-900 dark:text-orange-800',
        progress: 'bg-orange-200',
        border: 'border-orange-300'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => {
        const colorClasses = getColorClasses(kpi.color);
        return (
          <Card 
            key={index} 
            className={`relative group hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:${colorClasses.border} cursor-pointer`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg} rounded-lg opacity-50 group-hover:opacity-70 transition-opacity border border-border/20`} />
            
            {/* Content */}
            <CardContent className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses.icon} text-azure-50 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                  <kpi.icon className="w-7 h-7" />
                </div>
                
                <div className="text-right">
                  <div className={`text-3xl font-bold text-foreground`}>
                    {kpi.value}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {kpi.subtitle}
                  </div>
                </div>
              </div>

              {/* Title and Trend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    {kpi.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-700 dark:text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-700 dark:text-red-600" />
                    )}
                    <span className={`text-sm font-bold ${
                      kpi.trend === 'up' ? 'text-green-700 dark:text-green-600' : 'text-red-700 dark:text-red-600'
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress 
                    value={kpi.progress} 
                    className={`h-2 ${colorClasses.progress}`}
                  />
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">Progresso</span>
                    <span className={`font-bold text-foreground`}>
                      {kpi.progress.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mt-4 pt-3 border-t border-border/50">
                  {Object.entries(kpi.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-foreground font-medium capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="font-bold text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProfessionalKPICards;