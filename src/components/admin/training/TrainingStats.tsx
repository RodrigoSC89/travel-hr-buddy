import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export const TrainingStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["training-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_training_records")
        .select("status, valid_until");
      
      if (error) throw error;
      
      const total = data.length;
      const completed = data.filter(r => r.status === "completed").length;
      const inProgress = data.filter(r => r.status === "in_progress").length;
      const expired = data.filter(r => 
        r.valid_until && new Date(r.valid_until) < new Date()
      ).length;
      const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { total, completed, inProgress, expired, complianceRate };
    }
  });

  if (isLoading) {
    return null;
  }

  const statCards = [
    {
      title: "Total de Registros",
      value: stats?.total || 0,
      icon: GraduationCap,
      color: "text-blue-600"
    },
    {
      title: "Concluídos",
      value: stats?.completed || 0,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Em Progresso",
      value: stats?.inProgress || 0,
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Expirados",
      value: stats?.expired || 0,
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
                  Taxa de compliance: {stats.complianceRate}%
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
