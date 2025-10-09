import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, DollarSign, Bell, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserStatistics {
  total_alerts: number;
  active_alerts: number;
  total_savings: number;
  alerts_triggered: number;
}

interface AlertMetrics {
  total_products: number;
  average_discount: number;
  best_deal: {
    product_name: string;
    discount_percentage: number;
  } | null;
  categories: { [key: string]: number };
}

export const StatisticsDashboard = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<UserStatistics>({
    total_alerts: 0,
    active_alerts: 0,
    total_savings: 0,
    alerts_triggered: 0,
  });
  const [metrics, setMetrics] = useState<AlertMetrics>({
    total_products: 0,
    average_discount: 0,
    best_deal: null,
    categories: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStatistics();
      loadMetrics();
    }
  }, [user]);

  const loadStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from("user_statistics")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading statistics:", error);
        return;
      }

      if (data) {
        setStatistics(data);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data: alerts, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error loading alerts:", error);
        return;
      }

      if (alerts) {
        // Calcular métricas
        const total_products = alerts.length;
        const discounts = alerts
          .filter(alert => alert.discount_percentage > 0)
          .map(alert => alert.discount_percentage);

        const average_discount =
          discounts.length > 0 ? discounts.reduce((a, b) => a + b, 0) / discounts.length : 0;

        const best_deal =
          alerts
            .filter(alert => alert.discount_percentage > 0)
            .sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))[0] || null;

        // Agrupar por categorias
        const categories = alerts.reduce(
          (acc, alert) => {
            const category = alert.category || "Outros";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          },
          {} as { [key: string]: number }
        );

        setMetrics({
          total_products,
          average_discount,
          best_deal: best_deal
            ? {
              product_name: best_deal.product_name,
              discount_percentage: best_deal.discount_percentage || 0,
            }
            : null,
          categories,
        });
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyPercentage = () => {
    if (statistics.total_alerts === 0) return 0;
    return Math.round((statistics.alerts_triggered / statistics.total_alerts) * 100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_alerts}</div>
            <p className="text-xs text-muted-foreground">{statistics.active_alerts} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {statistics.total_savings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.alerts_triggered} alertas acionados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getEfficiencyPercentage()}%</div>
            <Progress value={getEfficiencyPercentage()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desconto Médio</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.average_discount.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Em {metrics.total_products} produtos</p>
          </CardContent>
        </Card>
      </div>

      {/* Melhor Oferta */}
      {metrics.best_deal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Melhor Oferta Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{metrics.best_deal.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  Economia potencial de {metrics.best_deal.discount_percentage.toFixed(1)}%
                </p>
              </div>
              <Badge variant="secondary" className="text-lg">
                -{metrics.best_deal.discount_percentage.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Produtos por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.categories).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="font-medium">{category}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{count}</Badge>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{
                        width: `${(count / metrics.total_products) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
