import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export const CronJobStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["cron-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_cron_job_stats");
      
      if (error) throw error;
      return data[0];
    }
  });

  if (isLoading) {
    return null;
  }

  const statCards = [
    {
      title: "Total de Jobs",
      value: stats?.total_jobs || 0,
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Executando",
      value: stats?.running_jobs || 0,
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Com Falhas",
      value: stats?.failed_jobs || 0,
      icon: XCircle,
      color: "text-red-600"
    },
    {
      title: "Taxa de Sucesso",
      value: stats?.success_rate ? `${stats.success_rate.toFixed(1)}%` : "0%",
      icon: CheckCircle,
      color: "text-green-600"
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
              {index === 3 && stats?.avg_execution_time_ms && (
                <p className="text-xs text-muted-foreground">
                  Tempo médio: {Math.round(stats.avg_execution_time_ms)}ms
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
