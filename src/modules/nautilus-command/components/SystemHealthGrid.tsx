/**
 * System Health Grid - Status de saúde de todos os módulos
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Ship, Users, Wrench, Package, Shield, Activity,
  TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle
} from "lucide-react";

interface SystemStatus {
  fleet: { vessels: number; active: number; maintenance: number; alerts: number };
  crew: { total: number; onboard: number; onLeave: number; expiringCerts: number };
  maintenance: { scheduled: number; overdue: number; completed: number; efficiency: number };
  inventory: { lowStock: number; pendingOrders: number; value: number };
  compliance: { score: number; pendingAudits: number; expiringDocs: number };
}

interface SystemHealthGridProps {
  status: SystemStatus;
  expanded?: boolean;
}

export const SystemHealthGrid: React.FC<SystemHealthGridProps> = ({ status, expanded = false }) => {
  const modules = [
    {
      id: 'fleet',
      name: 'Gestão de Frota',
      icon: <Ship className="h-5 w-5" />,
      color: 'blue',
      health: status.fleet.alerts === 0 ? 100 : Math.max(0, 100 - status.fleet.alerts * 10),
      metrics: [
        { label: 'Embarcações', value: status.fleet.vessels },
        { label: 'Ativas', value: status.fleet.active },
        { label: 'Manutenção', value: status.fleet.maintenance },
      ],
      trend: status.fleet.alerts === 0 ? 'up' : 'down',
      alerts: status.fleet.alerts
    },
    {
      id: 'crew',
      name: 'Tripulação',
      icon: <Users className="h-5 w-5" />,
      color: 'green',
      health: status.crew.expiringCerts === 0 ? 100 : Math.max(0, 100 - status.crew.expiringCerts * 5),
      metrics: [
        { label: 'Total', value: status.crew.total },
        { label: 'A bordo', value: status.crew.onboard },
        { label: 'Em licença', value: status.crew.onLeave },
      ],
      trend: status.crew.expiringCerts === 0 ? 'up' : 'stable',
      alerts: status.crew.expiringCerts
    },
    {
      id: 'maintenance',
      name: 'Manutenção',
      icon: <Wrench className="h-5 w-5" />,
      color: 'orange',
      health: status.maintenance.efficiency,
      metrics: [
        { label: 'Agendadas', value: status.maintenance.scheduled },
        { label: 'Concluídas', value: status.maintenance.completed },
        { label: 'Eficiência', value: `${status.maintenance.efficiency}%` },
      ],
      trend: status.maintenance.overdue === 0 ? 'up' : 'down',
      alerts: status.maintenance.overdue
    },
    {
      id: 'inventory',
      name: 'Estoque & Compras',
      icon: <Package className="h-5 w-5" />,
      color: 'purple',
      health: status.inventory.lowStock === 0 ? 100 : Math.max(0, 100 - status.inventory.lowStock * 8),
      metrics: [
        { label: 'Baixo estoque', value: status.inventory.lowStock },
        { label: 'Pedidos', value: status.inventory.pendingOrders },
        { label: 'Valor', value: `R$ ${(status.inventory.value / 1000000).toFixed(1)}M` },
      ],
      trend: status.inventory.lowStock === 0 ? 'up' : 'down',
      alerts: status.inventory.lowStock
    },
    {
      id: 'compliance',
      name: 'Compliance',
      icon: <Shield className="h-5 w-5" />,
      color: 'cyan',
      health: status.compliance.score,
      metrics: [
        { label: 'Score', value: `${status.compliance.score}%` },
        { label: 'Auditorias', value: status.compliance.pendingAudits },
        { label: 'Docs exp.', value: status.compliance.expiringDocs },
      ],
      trend: status.compliance.score >= 95 ? 'up' : 'stable',
      alerts: status.compliance.expiringDocs
    }
  ];

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-500';
    if (health >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBg = (health: number) => {
    if (health >= 90) return 'bg-green-500';
    if (health >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Saúde do Sistema
            </CardTitle>
            <CardDescription>
              Status operacional de todos os módulos
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {modules.filter(m => m.health >= 90).length}/{modules.length} Saudáveis
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${expanded ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-${module.color}-100 dark:bg-${module.color}-900/20`}>
                        {module.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{module.name}</h4>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(module.trend)}
                          <span className={`text-xs ${getHealthColor(module.health)}`}>
                            {module.health}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {module.alerts > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {module.alerts}
                      </Badge>
                    )}
                  </div>

                  <Progress value={module.health} className={`h-1.5 mb-3 ${getHealthBg(module.health)}`} />

                  <div className="grid grid-cols-3 gap-2 text-center">
                    {module.metrics.map((metric, i) => (
                      <div key={i} className="bg-muted/50 rounded-md p-2">
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                        <p className="text-sm font-semibold">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
