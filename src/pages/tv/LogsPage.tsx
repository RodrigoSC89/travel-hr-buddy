"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Activity, RefreshCw, TrendingUp } from "lucide-react";

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface RestoreCountByDay {
  day: string;
  count: number;
}

interface RestoreCountByStatus {
  name: string;
  value: number;
}

interface DashboardData {
  summary: RestoreSummary;
  byDay: RestoreCountByDay[];
  byStatus: RestoreCountByStatus[];
}

const COLORS = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

const STATUS_COLORS: Record<string, string> = {
  success: COLORS.success,
  error: COLORS.error,
  warning: COLORS.warning,
  info: COLORS.info,
};

export default function TVWallLogsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch summary data
      const { data: summaryData, error: summaryError } = await supabase.rpc(
        "get_restore_summary",
        { email_input: null }
      );

      if (summaryError) throw summaryError;

      // Fetch count by day (last 15 days)
      const { data: byDayData, error: byDayError } = await supabase.rpc(
        "get_restore_count_by_day_with_email",
        { email_input: null }
      );

      if (byDayError) throw byDayError;

      // Fetch status distribution from last 100 logs
      const { data: statusData, error: statusError } = await supabase
        .from("restore_report_logs")
        .select("status")
        .order("executed_at", { ascending: false })
        .limit(100);

      if (statusError) throw statusError;

      // Process summary
      const summary: RestoreSummary = summaryData?.[0] || {
        total: 0,
        unique_docs: 0,
        avg_per_day: 0,
      };

      // Process byDay data - limit to last 15 days
      const byDay: RestoreCountByDay[] = (byDayData || [])
        .slice(0, 15)
        .reverse()
        .map((row: { day: string; count: number }) => ({
          day: format(new Date(row.day), "MMM d", { locale: ptBR }),
          count: row.count,
        }));

      // Group by status and count
      const statusCounts: Record<string, number> = {};
      statusData?.forEach((row: { status: string }) => {
        const status = row.status || "info";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const byStatus: RestoreCountByStatus[] = Object.entries(statusCounts).map(
        ([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
        })
      );

      setData({
        summary,
        byDay,
        byStatus,
      });

      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      console.error("Error fetching TV Wall data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500">Erro ao carregar dados</p>
          <p className="text-sm text-gray-400 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity className="w-10 h-10 text-blue-500" />
            <h1 className="text-4xl font-bold">📺 Restore Logs - Real Time</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Última atualização</p>
            <p className="text-lg font-mono">
              {format(lastUpdate, "dd/MM/yyyy HH:mm:ss")}
            </p>
            <p className="text-xs text-gray-500">
              Auto-refresh: 60s
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-300 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Total de Restaurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">
              {data?.summary.total.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-300 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Documentos Únicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">
              {data?.summary.unique_docs.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-300 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-500" />
              Média por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">
              {data?.summary.avg_per_day.toFixed(1) || "0.0"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Restores by Day */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Restaurações por Dia (Últimos 15 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.byDay && data.byDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-400">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Status dos Relatórios (Últimos 100)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.byStatus && data.byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data.byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.byStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.name.toLowerCase()] ||
                          COLORS.info
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-400">
                Sem dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Nautilus One © 2025 - TV Wall Dashboard</p>
      </div>
    </div>
  );
}
