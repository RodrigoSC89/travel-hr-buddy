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
        bg: 'from-emerald-700/90 to-green-800/90',
        icon: 'from-emerald-500 to-green-600',
        text: 'text-white',
        progress: 'bg-emerald-200',
        border: 'border-emerald-400',
        card: 'bg-emerald-800/95 border-emerald-600/50'
      },
      blue: {
        bg: 'from-azure-700/90 to-azure-800/90',
        icon: 'from-azure-400 to-azure-500',
        text: 'text-white',
        progress: 'bg-azure-200',
        border: 'border-azure-400',
        card: 'bg-azure-800/95 border-azure-600/50'
      },
      purple: {
        bg: 'from-purple-700/90 to-violet-800/90',
        icon: 'from-purple-400 to-violet-500',
        text: 'text-white',
        progress: 'bg-purple-200',
        border: 'border-purple-400',
        card: 'bg-purple-800/95 border-purple-600/50'
      },
      orange: {
        bg: 'from-orange-700/90 to-amber-800/90',
        icon: 'from-orange-400 to-amber-500',
        text: 'text-white',
        progress: 'bg-orange-200',
        border: 'border-orange-400',
        card: 'bg-orange-800/95 border-orange-600/50'
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
            className={`relative group hover:shadow-2xl transition-all duration-500 border-2 ${colorClasses.card} hover:${colorClasses.border} cursor-pointer overflow-hidden backdrop-blur-sm`}
          >
            {/* Background Gradient - Fundo Escuro Premium */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg} rounded-lg opacity-95 group-hover:opacity-100 transition-opacity`} />
            
            {/* Content */}
            <CardContent className="relative p-6 text-white">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses.icon} text-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                  <kpi.icon className="w-7 h-7" />
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {kpi.value}
                  </div>
                  <div className="text-sm font-medium text-white/80">
                    {kpi.subtitle}
                  </div>
                </div>
              </div>

              {/* Title and Trend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    {kpi.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-300" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-300" />
                    )}
                    <span className={`text-sm font-bold ${
                      kpi.trend === 'up' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress 
                    value={kpi.progress} 
                    className="h-2 bg-white/20"
                  />
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-white/90">Progresso</span>
                    <span className="font-bold text-white">
                      {kpi.progress.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Details */}
                {/* Details */}
                <div className="space-y-2 mt-4 pt-3 border-t border-white/20">
                  {Object.entries(kpi.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-white/80 font-medium capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="font-bold text-white">
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