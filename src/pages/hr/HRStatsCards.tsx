import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';

interface HRStatsCardsProps {
  statsLoading: boolean;
  displayStats: {
    totalEmployees: number;
    activeEmployees: number;
    turnoverRate: number;
    expiringCertificates: number;
    pendingVacations: number;
  };
}

const cards: Array<{ key: keyof HRStatsCardsProps['displayStats']; label: string; icon: React.ElementType; gradient: string; border: string; iconBg: string; iconColor: string; suffix?: string }> = [
  { key: 'totalEmployees', label: 'Colaboradores', icon: Users, gradient: 'from-primary/10 to-primary/5', border: 'border-primary/20', iconBg: 'bg-primary/20', iconColor: 'text-primary' },
  { key: 'activeEmployees', label: 'Embarcados', icon: UserPlus, gradient: 'from-success/10 to-success/5', border: 'border-success/20', iconBg: 'bg-success/20', iconColor: 'text-success' },
  { key: 'turnoverRate', label: 'Turnover', icon: TrendingUp, gradient: 'from-warning/10 to-warning/5', border: 'border-warning/20', iconBg: 'bg-warning/20', iconColor: 'text-warning', suffix: '%' },
  { key: 'expiringCertificates', label: 'Cert. Expirando', icon: AlertTriangle, gradient: 'from-destructive/10 to-destructive/5', border: 'border-destructive/20', iconBg: 'bg-destructive/20', iconColor: 'text-destructive' },
  { key: 'pendingVacations', label: 'Férias Pendentes', icon: Calendar, gradient: 'from-accent/10 to-accent/5', border: 'border-accent/20', iconBg: 'bg-accent/20', iconColor: 'text-accent-foreground' },
];

export const HRStatsCards: React.FC<HRStatsCardsProps> = ({ statsLoading, displayStats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.key} className={`bg-gradient-to-br ${card.gradient} ${card.border}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${card.iconBg} rounded-lg`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">
                    {displayStats[card.key]}{card.suffix || ''}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
