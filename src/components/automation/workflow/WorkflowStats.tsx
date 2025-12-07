import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, Zap, Target, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import type { Workflow as WorkflowType, AutomationRule } from "@/hooks/useWorkflows";

interface WorkflowStatsProps {
  workflows: WorkflowType[];
  automationRules: AutomationRule[];
}

export const WorkflowStats: React.FC<WorkflowStatsProps> = ({
  workflows,
  automationRules,
}) => {
  const activeWorkflows = workflows.filter(w => w.status === "active").length;
  const activeAutomations = automationRules.filter(r => r.is_active).length;
  const avgProgress = workflows.length > 0 
    ? Math.round(workflows.reduce((acc, w) => acc + w.progress, 0) / workflows.length) 
    : 0;
  
  const totalExecutions = automationRules.reduce((acc, r) => acc + r.execution_count, 0);

  const stats = [
    {
      title: "Workflows Ativos",
      value: activeWorkflows,
      subtitle: `de ${workflows.length} workflows`,
      icon: Workflow,
      trend: "+2 esta semana",
      trendUp: true,
    },
    {
      title: "Automações Ativas",
      value: activeAutomations,
      subtitle: `${automationRules.length} regras configuradas`,
      icon: Zap,
      trend: "Todas funcionando",
      trendUp: true,
    },
    {
      title: "Progresso Médio",
      value: `${avgProgress}%`,
      subtitle: "dos workflows",
      icon: Target,
      trend: avgProgress > 50 ? "Acima da meta" : "Abaixo da meta",
      trendUp: avgProgress > 50,
    },
    {
      title: "Execuções Hoje",
      value: totalExecutions,
      subtitle: "+12% vs ontem",
      icon: RefreshCw,
      trend: "Crescendo",
      trendUp: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              <div className={`flex items-center text-xs ${stat.trendUp ? "text-green-600" : "text-red-500"}`}>
                {stat.trendUp ? (
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                )}
                <span className="hidden xl:inline">{stat.trend}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
