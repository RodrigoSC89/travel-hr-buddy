import React from 'react';
import { StatsCard } from '@/components/ui/stats-card';
import { RealTimeMonitor } from '@/components/ui/real-time-monitor';
import { PerformanceMetrics } from '@/components/ui/performance-metrics';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  Plane, 
  Building, 
  DollarSign, 
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const GlobalDashboard = () => {
  const stats = [
    {
      title: "Funcionários Ativos",
      value: "1,247",
      icon: Users,
      change: { value: 8, type: 'increase' as const },
      variant: 'ocean' as const
    },
    {
      title: "Viagens em Andamento",
      value: "23",
      icon: Plane,
      change: { value: 12, type: 'increase' as const },
      variant: 'default' as const
    },
    {
      title: "Reservas de Hotel",
      value: "45",
      icon: Building,
      change: { value: 3, type: 'decrease' as const },
      variant: 'default' as const
    },
    {
      title: "Economia Total",
      value: "R$ 127k",
      icon: DollarSign,
      change: { value: 15, type: 'increase' as const },
      variant: 'success' as const
    }
  ];

  const recentActivities = [
    {
      type: 'flight',
      message: 'Nova reserva de voo para São Paulo',
      time: '2 min atrás',
      status: 'success'
    },
    {
      type: 'hotel',
      message: 'Check-in confirmado no Hotel Copacabana',
      time: '15 min atrás',
      status: 'info'
    },
    {
      type: 'hr',
      message: 'Novo funcionário cadastrado',
      time: '1h atrás',
      status: 'success'
    },
    {
      type: 'alert',
      message: 'Voo atrasado - Notificar passageiro',
      time: '2h atrás',
      status: 'warning'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
            Dashboard Executivo
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema Nautilus One
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock size={16} />
          <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-primary" size={20} />
            Ações Rápidas
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 text-left rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
              <div className="flex items-center">
                <Plane className="mr-3 text-primary" size={18} />
                <div>
                  <p className="font-medium">Nova Reserva de Voo</p>
                  <p className="text-sm text-muted-foreground">Buscar e reservar passagens</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-3 text-left rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors">
              <div className="flex items-center">
                <Building className="mr-3 text-secondary" size={18} />
                <div>
                  <p className="font-medium">Reservar Hotel</p>
                  <p className="text-sm text-muted-foreground">Melhores preços garantidos</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-3 text-left rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors">
              <div className="flex items-center">
                <Users className="mr-3 text-accent" size={18} />
                <div>
                  <p className="font-medium">Cadastrar Funcionário</p>
                  <p className="text-sm text-muted-foreground">Gestão de recursos humanos</p>
                </div>
              </div>
            </button>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-warning" size={20} />
            Atividades Recentes
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-success' :
                  activity.status === 'warning' ? 'bg-warning' :
                  activity.status === 'info' ? 'bg-info' : 'bg-muted-foreground'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Chart Placeholder */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="mr-2 text-info" size={20} />
            Destinos Populares
          </h3>
          <div className="space-y-4">
            {[
              { city: 'São Paulo', trips: 45, savings: 'R$ 12k' },
              { city: 'Rio de Janeiro', trips: 32, savings: 'R$ 8k' },
              { city: 'Brasília', trips: 28, savings: 'R$ 6k' },
              { city: 'Salvador', trips: 19, savings: 'R$ 4k' }
            ].map((destination, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5">
                <div>
                  <p className="font-medium">{destination.city}</p>
                  <p className="text-sm text-muted-foreground">{destination.trips} viagens</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success">{destination.savings}</p>
                  <p className="text-xs text-muted-foreground">economia</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monitoramento em Tempo Real */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Monitoramento em Tempo Real</h3>
        <RealTimeMonitor />
      </div>

      {/* Métricas de Performance */}
      <div className="space-y-6">
        <PerformanceMetrics compact={true} />
      </div>
    </div>
  );
};