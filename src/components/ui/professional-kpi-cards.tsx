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
        bg: 'from-emerald-50 to-green-50',
        icon: 'from-emerald-500 to-green-600',
        text: 'text-emerald-700',
        progress: 'bg-emerald-100',
        border: 'border-emerald-200'
      },
      blue: {
        bg: 'from-blue-50 to-indigo-50',
        icon: 'from-blue-500 to-indigo-600',
        text: 'text-blue-700',
        progress: 'bg-blue-100',
        border: 'border-blue-200'
      },
      purple: {
        bg: 'from-purple-50 to-violet-50',
        icon: 'from-purple-500 to-violet-600',
        text: 'text-purple-700',
        progress: 'bg-purple-100',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'from-orange-50 to-amber-50',
        icon: 'from-orange-500 to-amber-600',
        text: 'text-orange-700',
        progress: 'bg-orange-100',
        border: 'border-orange-200'
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
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg} rounded-lg opacity-60 group-hover:opacity-80 transition-opacity`} />
            
            {/* Content */}
            <CardContent className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses.icon} text-azure-50 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                  <kpi.icon className="w-7 h-7" />
                </div>
                
                <div className="text-right">
                  <div className={`text-3xl font-bold ${colorClasses.text}`}>
                    {kpi.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {kpi.subtitle}
                  </div>
                </div>
              </div>

              {/* Title and Trend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {kpi.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
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
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Atual</span>
                    <span className={`font-medium ${colorClasses.text}`}>
                      {kpi.progress.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mt-4 pt-3 border-t border-border/30">
                  {Object.entries(kpi.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-muted-foreground capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="font-medium text-foreground">
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