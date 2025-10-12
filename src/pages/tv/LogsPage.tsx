"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface RestoreCountByDay {
  day: string;
  count: number;
}

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface StatusData {
  name: string;
  value: number;
}

const COLORS = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

export default function TVWallLogs() {
  const [countByDay, setCountByDay] = useState<RestoreCountByDay[]>([]);
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch restore count by day
      const { data: countData, error: countError } = await supabase.rpc(
        "get_restore_count_by_day_with_email",
        { email_input: "" }
      );

      if (countError) {
        console.error("Error fetching restore count by day:", countError);
      } else if (countData) {
        setCountByDay(countData);
      }

      // Fetch summary statistics
      const { data: summaryData, error: summaryError } = await supabase.rpc(
        "get_restore_summary",
        { email_input: "" }
      );

      if (summaryError) {
        console.error("Error fetching restore summary:", summaryError);
      } else if (summaryData && summaryData.length > 0) {
        setSummary(summaryData[0]);
      }

      // Fetch status distribution from restore_report_logs
      const { data: logsData, error: logsError } = await supabase
        .from("restore_report_logs")
        .select("status")
        .order("executed_at", { ascending: false })
        .limit(100);

      if (logsError) {
        console.error("Error fetching status data:", logsError);
      } else if (logsData) {
        // Count statuses
        const statusCounts: Record<string, number> = {};
        logsData.forEach((log) => {
          const status = log.status.toLowerCase();
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Convert to array for pie chart
        const statusArray = Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }));

        setStatusData(statusArray);
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">📺 Restore Logs - Real Time</h1>
          <div className="text-right">
            <p className="text-xl text-gray-400">
              Última atualização: {format(lastUpdate, "HH:mm:ss", { locale: ptBR })}
            </p>
            <p className="text-sm text-gray-500">Atualiza a cada 60 segundos</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">Total de Restaurações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-blue-400">
              {summary?.total || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">Documentos Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-green-400">
              {summary?.unique_docs || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">Média por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-purple-400">
              {summary?.avg_per_day || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart - Restore Count by Day */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Restaurações por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {countByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={countByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="day"
                    stroke="#9ca3af"
                    tickFormatter={(value) =>
                      format(new Date(value), "dd/MMM", { locale: ptBR })
                    }
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      color: "#fff",
                    }}
                    labelFormatter={(value) =>
                      format(new Date(value), "dd 'de' MMMM, yyyy", { locale: ptBR })
                    }
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-gray-400 text-lg">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Status dos Relatórios</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={statusData}
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
                    {statusData.map((entry, index) => {
                      const colorKey = entry.name.toLowerCase() as keyof typeof COLORS;
                      const color = COLORS[colorKey] || COLORS.info;
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      color: "#fff",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#fff" }}
                    formatter={(value) => <span style={{ color: "#fff" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-gray-400 text-lg">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© 2025 Travel HR Buddy - Dashboard de Monitoramento em Tempo Real</p>
      </div>
    </div>
  );
}
