import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CalendarIcon, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react';
import { EnhancedReservation } from './enhanced-reservations-dashboard';

interface ReservationStatsProps {
  reservations: EnhancedReservation[];
}

export const ReservationStats: React.FC<ReservationStatsProps> = ({ reservations }) => {
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length;
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length;
  const completedReservations = reservations.filter(r => r.status === 'completed').length;
  const conflictedReservations = reservations.filter(r => r.conflict_detected).length;
  
  const totalAmount = reservations
    .filter(r => r.total_amount && r.status !== 'cancelled')
    .reduce((sum, r) => sum + (r.total_amount || 0), 0);

  const upcomingReservations = reservations.filter(r => 
    new Date(r.start_date) > new Date() && r.status === 'confirmed'
  ).length;

  const uniqueCrewMembers = new Set(
    reservations.map(r => r.crew_member_name).filter(Boolean)
  ).size;

  const stats = [
    {
      title: 'Total de Reservas',
      value: totalReservations,
      icon: CalendarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Confirmadas',
      value: confirmedReservations,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Pendentes',
      value: pendingReservations,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      title: 'Próximas',
      value: upcomingReservations,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Valor Total',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(totalAmount),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      title: 'Tripulantes',
      value: uniqueCrewMembers,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
    },
    {
      title: 'Canceladas',
      value: cancelledReservations,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      title: 'Conflitos',
      value: conflictedReservations,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground truncate">{stat.title}</p>
                <p className="text-lg font-bold truncate" title={stat.value.toString()}>
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};