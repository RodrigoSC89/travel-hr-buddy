/**
 * Operational KPIs - Indicadores chave de performance
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, Target, Gauge,
  Ship, Users, Wrench, Package, Shield, DollarSign, Clock
} from "lucide-react";

interface SystemStatus {
  fleet: { vessels: number; active: number; maintenance: number; alerts: number };
  crew: { total: number; onboard: number; onLeave: number; expiringCerts: number };
  maintenance: { scheduled: number; overdue: number; completed: number; efficiency: number };
  inventory: { lowStock: number; pendingOrders: number; value: number };
  compliance: { score: number; pendingAudits: number; expiringDocs: number };
}

interface OperationalKPIsProps {
  status: SystemStatus;
}

export const OperationalKPIs: React.FC<OperationalKPIsProps> = ({ status }) => {
  const kpis = [
    {
      category: "Operacional",
      icon: <Ship className="h-5 w-5" />,
      color: "blue",
      items: [
        {
          name: "Disponibilidade da Frota",
          value: status.fleet.vessels > 0 ? Math.round((status.fleet.active / status.fleet.vessels) * 100) : 0,
          target: 95,
          unit: "%",
          trend: "up"
        },
        {
          name: "Embarcações em Operação",
          value: status.fleet.active,
          target: status.fleet.vessels,
          unit: "un",
          trend: "stable"
        },
        {
          name: "Alertas Ativos",
          value: status.fleet.alerts,
          target: 0,
          unit: "un",
          trend: status.fleet.alerts > 0 ? "down" : "up"
        }
      ]
    },
    {
      category: "Manutenção",
      icon: <Wrench className="h-5 w-5" />,
      color: "orange",
      items: [
        {
          name: "Eficiência de Manutenção",
          value: status.maintenance.efficiency,
          target: 95,
          unit: "%",
          trend: status.maintenance.efficiency >= 95 ? "up" : "down"
        },
        {
          name: "Manutenções Concluídas",
          value: status.maintenance.completed,
          target: null,
          unit: "un",
          trend: "up"
        },
        {
          name: "Manutenções Vencidas",
          value: status.maintenance.overdue,
          target: 0,
          unit: "un",
          trend: status.maintenance.overdue > 0 ? "down" : "up"
        }
      ]
    },
    {
      category: "Tripulação",
      icon: <Users className="h-5 w-5" />,
      color: "green",
      items: [
        {
          name: "Taxa de Presença",
          value: status.crew.total > 0 ? Math.round((status.crew.onboard / status.crew.total) * 100) : 0,
          target: 90,
          unit: "%",
          trend: "up"
        },
        {
          name: "Tripulantes a Bordo",
          value: status.crew.onboard,
          target: status.crew.total,
          unit: "un",
          trend: "stable"
        },
        {
          name: "Certificados Válidos",
          value: status.crew.total > 0 ? Math.round(((status.crew.total - status.crew.expiringCerts) / status.crew.total) * 100) : 100,
          target: 100,
          unit: "%",
          trend: status.crew.expiringCerts > 0 ? "down" : "up"
        }
      ]
    },
    {
      category: "Suprimentos",
      icon: <Package className="h-5 w-5" />,
      color: "purple",
      items: [
        {
          name: "Nível de Estoque",
          value: status.inventory.lowStock === 0 ? 100 : Math.max(0, 100 - status.inventory.lowStock * 5),
          target: 95,
          unit: "%",
          trend: status.inventory.lowStock > 0 ? "down" : "up"
        },
        {
          name: "Valor Total em Estoque",
          value: Math.round(status.inventory.value / 1000000 * 10) / 10,
          target: null,
          unit: "M",
          trend: "stable"
        },
        {
          name: "Pedidos Pendentes",
          value: status.inventory.pendingOrders,
          target: null,
          unit: "un",
          trend: "stable"
        }
      ]
    },
    {
      category: "Compliance",
      icon: <Shield className="h-5 w-5" />,
      color: "cyan",
      items: [
        {
          name: "Score de Compliance",
          value: status.compliance.score,
          target: 100,
          unit: "%",
          trend: status.compliance.score >= 95 ? "up" : "down"
        },
        {
          name: "Auditorias Pendentes",
          value: status.compliance.pendingAudits,
          target: 0,
          unit: "un",
          trend: status.compliance.pendingAudits > 0 ? "down" : "up"
        },
        {
          name: "Documentos Válidos",
          value: 100 - (status.compliance.expiringDocs * 2),
          target: 100,
          unit: "%",
          trend: status.compliance.expiringDocs > 0 ? "down" : "up"
        }
      ]
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up": return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "down": return <TrendingDown className="h-4 w-4 text-red-500" />;
    default: return <Gauge className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getValueColor = (value: number, target: number | null) => {
    if (target === null) return "text-foreground";
    if (value >= target) return "text-green-600";
    if (value >= target * 0.8) return "text-yellow-600";
    return "text-red-600";
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Indicadores de Performance (KPIs)
              </CardTitle>
              <CardDescription>
                Métricas operacionais em tempo real
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Atualizado agora
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {kpis.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {category.icon}
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category.items.map((kpi, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate pr-2">
                            {kpi.name}
                          </span>
                          {getTrendIcon(kpi.trend)}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-bold ${getValueColor(kpi.value, kpi.target)}`}>
                            {kpi.unit === "M" ? `R$ ${kpi.value}` : kpi.value}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {kpi.unit === "M" ? "M" : kpi.unit}
                          </span>
                          {kpi.target !== null && (
                            <span className="text-xs text-muted-foreground">
                              / {kpi.target}{kpi.unit}
                            </span>
                          )}
                        </div>
                        {kpi.target !== null && (
                          <Progress
                            value={Math.min(100, (kpi.value / kpi.target) * 100)}
                            className="h-1"
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
