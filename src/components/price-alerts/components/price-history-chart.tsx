import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingDown, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PriceHistory {
  id: string;
  price: number;
  checked_at: string;
}

interface Alert {
  id: string;
  product_name: string;
  target_price: number;
  current_price: number;
}

interface ChartData {
  date: string;
  price: number;
  target: number;
}

export const PriceHistoryChart = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<string>("");
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAlert) {
      loadPriceHistory();
    }
  }, [selectedAlert, timeRange]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("price_alerts")
        .select("id, product_name, target_price, current_price")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: false });

      if (error) {
        return;
      }

      if (data && data.length > 0) {
        const mappedAlerts = data.map(alert => ({
          ...alert,
          current_price: alert.current_price ?? 0
        }));
        setAlerts(mappedAlerts);
        if (!selectedAlert) {
          setSelectedAlert(data[0].id);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadPriceHistory = async () => {
    if (!selectedAlert) return;

    try {
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from("price_history")
        .select("*")
        .eq("alert_id", selectedAlert)
        .gte("checked_at", startDate.toISOString())
        .order("checked_at", { ascending: true });

      if (error) {
        return;
      }

      if (data) {
        setPriceHistory(data);
        
        // Preparar dados para o gráfico
        const selectedAlertData = alerts.find(a => a.id === selectedAlert);
        const targetPrice = selectedAlertData?.target_price || 0;

        const formattedData: ChartData[] = data.map(item => ({
          date: format(new Date(item.checked_at), "dd/MM"),
          price: Number(item.price),
          target: targetPrice,
        }));

        setChartData(formattedData);
      }
    } catch (error) {
    }
  };

  const getCurrentAlert = () => alerts.find(a => a.id === selectedAlert);

  const getPriceChange = () => {
    if (chartData.length < 2) return null;
    
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    return {
      percentage: change,
      isPositive: change > 0,
      value: Math.abs(lastPrice - firstPrice),
    };
  };

  const getLowestPrice = () => {
    if (chartData.length === 0) return null;
    return Math.min(...chartData.map(d => d.price));
  };

  const getHighestPrice = () => {
    if (chartData.length === 0) return null;
    return Math.max(...chartData.map(d => d.price));
  };

  const priceChange = getPriceChange();
  const lowestPrice = getLowestPrice();
  const highestPrice = getHighestPrice();
  const currentAlert = getCurrentAlert();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Preços</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum alerta encontrado. Crie um alerta para ver o histórico de preços.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Histórico de Preços</CardTitle>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(value: "7d" | "30d" | "90d") => setTimeRange(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Select value={selectedAlert} onValueChange={setSelectedAlert}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {alerts.map(alert => (
              <SelectItem key={alert.id} value={alert.id}>
                {alert.product_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      
      <CardContent>
        {/* Métricas do Período */}
        {currentAlert && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Preço Atual</p>
              <p className="text-lg font-bold">
                R$ {currentAlert.current_price?.toFixed(2) || "---"}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Meta</p>
              <p className="text-lg font-bold text-primary">
                R$ {currentAlert.target_price.toFixed(2)}
              </p>
            </div>
            
            {lowestPrice && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Menor Preço</p>
                <p className="text-lg font-bold text-green-600">
                  R$ {lowestPrice.toFixed(2)}
                </p>
              </div>
            )}
            
            {priceChange && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Variação</p>
                <div className="flex items-center justify-center gap-1">
                  {priceChange.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  <p className={`text-lg font-bold ${priceChange.isPositive ? "text-red-500" : "text-green-500"}`}>
                    {priceChange.isPositive ? "+" : ""}{priceChange.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gráfico */}
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={["dataMin - 10", "dataMax + 10"]}
                  tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toFixed(2)}`,
                    name === "price" ? "Preço" : "Meta"
                  ]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <ReferenceLine 
                  y={currentAlert?.target_price} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="5 5"
                  label={{ value: "Meta", position: "right" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">
              Sem dados de histórico para o período selecionado
            </p>
          </div>
        )}

        {/* Insights */}
        {currentAlert && lowestPrice && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Insights do Produto</h4>
            <div className="space-y-1 text-sm">
              {lowestPrice <= currentAlert.target_price && (
                <p className="text-green-600">
                  ✅ O produto já atingiu sua meta de preço no período analisado!
                </p>
              )}
              {currentAlert.current_price && currentAlert.current_price <= currentAlert.target_price && (
                <p className="text-green-600">
                  🎯 Preço atual está dentro da sua meta!
                </p>
              )}
              {priceChange && !priceChange.isPositive && (
                <p className="text-blue-600">
                  📉 Tendência de queda de {Math.abs(priceChange.percentage).toFixed(1)}% no período
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};