import React, { useEffect, useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Ship, Database, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface OrganizationStats {
  activeUsers: number;
  vessels: number;
  storageUsed: number;
}

export const OrganizationStatsCards: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const [stats, setStats] = useState<OrganizationStats>({
    activeUsers: 0,
    vessels: 0,
    storageUsed: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchOrganizationStats();
    }
  }, [currentOrganization?.id]);

  const fetchOrganizationStats = async () => {
    if (!currentOrganization?.id) return;

    try {
      setIsLoading(true);

      // Fetch active users count
      const { count: usersCount } = await supabase
        .from("organization_users")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", currentOrganization.id)
        .eq("status", "active");

      // Fetch vessels count
      const { count: vesselsCount } = await supabase
        .from("vessels")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", currentOrganization.id);

      // Fetch storage usage
      const { data: usageData } = await supabase
        .from("tenant_usage")
        .select("storage_used_gb")
        .eq("tenant_id", currentOrganization.id)
        .maybeSingle();

      setStats({
        activeUsers: usersCount || 0,
        vessels: vesselsCount || 0,
        storageUsed: usageData?.storage_used_gb || 0
      });

    } catch (error) {
      logger.error("Error fetching organization stats:", error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Não foi possível carregar os dados da organização",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentOrganization) {
    return null;
  }

  const statsCards = [
    {
      title: "Usuários Ativos",
      value: isLoading ? "..." : stats.activeUsers.toString(),
      icon: Users,
      description: `Limite: ${currentOrganization.max_users}`
    },
    {
      title: "Embarcações",
      value: isLoading ? "..." : stats.vessels.toString(),
      icon: Ship,
      description: `Limite: ${currentOrganization.max_vessels}`
    },
    {
      title: "Armazenamento",
      value: isLoading ? "..." : `${stats.storageUsed.toFixed(2)} GB`,
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
      {statsCards.map((stat) => (
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