import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface PriceHistoryData {
  date: string;
  price: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  alert_count: number;
}

interface StatsSummary {
  total_alerts: number;
  active_alerts: number;
  triggered_alerts: number;
  avg_savings: number;
  best_deal_savings: number;
  total_tracked_routes: number;
}

export const EnhancedHistoryStats: React.FC = () => {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState<PriceHistoryData[]>([]);
  const [stats, setStats] = useState<StatsSummary>({
    total_alerts: 0,
    active_alerts: 0,
    triggered_alerts: 0,
    avg_savings: 0,
    best_deal_savings: 0,
    total_tracked_routes: 0,
  });
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadHistoryData(), loadStatistics()]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados históricos");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryData = async () => {
    if (!user) return;

    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = subDays(new Date(), days);

    // Fetch price history from flight_price_history and hotel_price_history
    const { data: flightHistory, error: flightError } = await supabase
      .from("flight_price_history")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    const { data: hotelHistory, error: hotelError } = await supabase
      .from("hotel_price_history")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (flightError || hotelError) {
      console.error("Error loading history:", flightError || hotelError);
      return;
    }

    // Process and aggregate data by date
    const aggregatedData = processHistoryData(
      [...(flightHistory || []), ...(hotelHistory || [])],
      days
    );
    setHistoryData(aggregatedData);
  };

  const processHistoryData = (rawData: any[], days: number): PriceHistoryData[] => {
    const dataByDate = new Map<string, number[]>();
    
    rawData.forEach((item) => {
      const date = format(new Date(item.created_at), "yyyy-MM-dd");
      const price = item.price || 0;
      
      if (!dataByDate.has(date)) {
        dataByDate.set(date, []);
      }
      dataByDate.get(date)!.push(price);
    });

    const result: PriceHistoryData[] = [];
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - i - 1), "yyyy-MM-dd");
      const prices = dataByDate.get(date) || [];
      
      result.push({
        date: format(new Date(date), "dd/MM", { locale: ptBR }),
        price: prices.length > 0 ? prices[prices.length - 1] : 0,
        avg_price: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
        min_price: prices.length > 0 ? Math.min(...prices) : 0,
        max_price: prices.length > 0 ? Math.max(...prices) : 0,
        alert_count: prices.length,
      });
    }

    return result;
  };

  const loadStatistics = async () => {
    if (!user) return;

    // Get alert statistics
    const { data: alerts, error } = await supabase
      .from("travel_price_alerts")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading statistics:", error);
      return;
    }

    if (!alerts) return;

    const activeAlerts = alerts.filter((a) => a.alert_triggered === false);
    const triggeredAlerts = alerts.filter((a) => a.alert_triggered === true);
    
    const savingsData = alerts
      .filter((a) => a.current_price && a.target_price)
      .map((a) => a.target_price - (a.current_price || 0))
      .filter((s) => s > 0);

    const avgSavings = savingsData.length > 0 
      ? savingsData.reduce((a, b) => a + b, 0) / savingsData.length 
      : 0;
    
    const bestDealSavings = savingsData.length > 0 ? Math.max(...savingsData) : 0;

    // Count unique routes
    const uniqueRoutes = new Set(alerts.map((a) => a.route)).size;

    setStats({
      total_alerts: alerts.length,
      active_alerts: activeAlerts.length,
      triggered_alerts: triggeredAlerts.length,
      avg_savings: Math.round(avgSavings),
      best_deal_savings: Math.round(bestDealSavings),
      total_tracked_routes: uniqueRoutes,
    });
  };

  const handleRefresh = async () => {
    toast.info("Atualizando dados...");
    await loadData();
    toast.success("Dados atualizados!");
  };

  const handleExport = () => {
    const csvData = historyData.map((d) => ({
      Data: d.date,
      Preço: d.price,
      "Preço Médio": d.avg_price.toFixed(2),
      "Preço Mínimo": d.min_price,
      "Preço Máximo": d.max_price,
      Alertas: d.alert_count,
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historico-precos-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Histórico exportado com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_alerts}</div>
            <Badge variant="outline" className="mt-1">
              {stats.active_alerts} ativos
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertas Disparados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.triggered_alerts}
            </div>
            <p className="text-xs text-muted-foreground">Oportunidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Economia Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {stats.avg_savings}
            </div>
            <p className="text-xs text-muted-foreground">Por alerta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Melhor Negócio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {stats.best_deal_savings}
            </div>
            <p className="text-xs text-muted-foreground">Economia máxima</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rotas Monitoradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tracked_routes}</div>
            <p className="text-xs text-muted-foreground">Destinos únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="w-full"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Historical Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Preços</CardTitle>
              <CardDescription>
                Evolução dos preços monitorados nos últimos {timeRange}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Linha</SelectItem>
                  <SelectItem value="bar">Barras</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              {chartType === "line" ? (
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Preço Atual"
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg_price"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Preço Médio"
                  />
                  <Line
                    type="monotone"
                    dataKey="min_price"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={1}
                    name="Preço Mínimo"
                  />
                </LineChart>
              ) : (
                <BarChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="price"
                    fill="hsl(var(--primary))"
                    name="Preço Atual"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="avg_price"
                    fill="hsl(var(--chart-2))"
                    name="Preço Médio"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
