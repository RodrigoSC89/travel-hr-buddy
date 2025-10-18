import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";

export const SimulationStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["simulation-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulation_exercises")
        .select("status");
      
      if (error) throw error;
      
      const total = data.length;
      const completed = data.filter(s => s.status === "completed").length;
      const scheduled = data.filter(s => s.status === "scheduled").length;
      const overdue = data.filter(s => s.status === "overdue").length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { total, completed, scheduled, overdue, completionRate };
    }
  });

  if (isLoading) {
    return null;
  }

  const statCards = [
    {
      title: "Total de Simulações",
      value: stats?.total || 0,
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Concluídas",
      value: stats?.completed || 0,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Agendadas",
      value: stats?.scheduled || 0,
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Atrasadas",
      value: stats?.overdue || 0,
      icon: AlertTriangle,
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {index === 0 && stats && (
                <p className="text-xs text-muted-foreground">
                  Taxa de conclusão: {stats.completionRate}%
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
