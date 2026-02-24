/**
 * UserManagementHub - Polished Stats Cards with animations & gradients
 */
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Clock, Shield, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface StatsCardsProps {
  stats: { total: number; active: number; pending: number; admins: number; managers: number };
}

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const duration = 600;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <>{display}</>;
};

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const activePercent = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  const cards = [
    {
      title: "Total de Usuários",
      value: stats.total,
      icon: Users,
      trend: { value: "+2 este mês", up: true },
      tooltip: "Número total de usuários registrados na organização",
      gradient: "from-primary/10 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Usuários Ativos",
      value: stats.active,
      icon: CheckCircle,
      trend: { value: `${activePercent}% do total`, up: activePercent > 80 },
      tooltip: "Usuários que acessaram o sistema nos últimos 30 dias",
      gradient: "from-emerald-500/10 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      title: "Convites Pendentes",
      value: stats.pending,
      icon: Clock,
      trend: { value: "Aguardando aceitação", up: false },
      tooltip: "Convites enviados que ainda não foram aceitos",
      gradient: "from-amber-500/10 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      title: "Administradores",
      value: stats.admins,
      icon: Shield,
      trend: { value: `+${stats.managers} gerentes`, up: true },
      tooltip: "Usuários com permissões administrativas completas",
      gradient: "from-violet-500/10 to-violet-500/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const TrendIcon = card.trend.up ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className={`relative overflow-hidden border hover:shadow-md transition-all duration-300 cursor-default bg-gradient-to-br ${card.gradient}`}>
                    {/* Decorative circle */}
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5" />
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                          <p className="text-3xl font-bold tracking-tight">
                            <AnimatedNumber value={card.value} />
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendIcon className={`h-3 w-3 ${card.trend.up ? "text-emerald-600" : "text-muted-foreground"}`} />
                            {card.trend.value}
                          </p>
                        </div>
                        <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                          <Icon className={`h-5 w-5 ${card.iconColor}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{card.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
