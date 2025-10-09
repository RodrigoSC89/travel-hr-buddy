import React from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Ship, Database, TrendingUp } from "lucide-react";

export const OrganizationStatsCards: React.FC = () => {
  const { currentOrganization } = useOrganization();

  if (!currentOrganization) {
    return null;
  }

  const stats = [
    {
      title: "Usuários Ativos",
      value: "0", // TODO: buscar dados reais
      icon: Users,
      description: `Limite: ${currentOrganization.max_users}`
    },
    {
      title: "Embarcações",
      value: "0", // TODO: buscar dados reais
      icon: Ship,
      description: `Limite: ${currentOrganization.max_vessels}`
    },
    {
      title: "Armazenamento",
      value: "0 GB", // TODO: buscar dados reais
      icon: Database,
      description: `Limite: ${currentOrganization.max_storage_gb} GB`
    },
    {
      title: "Status",
      value: currentOrganization.status,
      icon: TrendingUp,
      description: "Status da organização"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};