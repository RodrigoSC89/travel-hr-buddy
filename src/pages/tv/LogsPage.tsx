"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Color scheme for status pie chart
const COLORS = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

interface RestoreCountByDay {
  restore_date: string;
  restore_count: number;
}

interface RestoreSummary {
  total_restores: number;
  unique_documents: number;
  avg_per_day: number;
}

interface StatusData {
  name: string;
  value: number;
}

export default function LogsPage() {
  const [restoresByDay, setRestoresByDay] = useState<RestoreCountByDay[]>([]);
  const [summary, setSummary] = useState<RestoreSummary>({
    total_restores: 0,
    unique_documents: 0,
    avg_per_day: 0,
  });
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch restore count by day (last 15 days)
      const { data: restoreData, error: restoreError } = await supabase.rpc(
        "get_restore_count_by_day_with_email",
        { email_input: "all" }
      );

      if (restoreError) {
        console.error("Error fetching restore count:", restoreError);
      } else if (restoreData) {
        // Sort by date and take last 15 days
        const sortedData = restoreData
          .sort(
            (a: RestoreCountByDay, b: RestoreCountByDay) =>
              new Date(a.restore_date).getTime() - new Date(b.restore_date).getTime()
          )
          .slice(-15);
        setRestoresByDay(sortedData);
      }

      // Fetch summary statistics
      const { data: summaryData, error: summaryError } = await supabase.rpc(
        "get_restore_summary",
        { email_input: "all" }
      );

      if (summaryError) {
        console.error("Error fetching summary:", summaryError);
      } else if (summaryData && summaryData.length > 0) {
        setSummary(summaryData[0]);
      }

      // Fetch status distribution from last 100 logs
      const { data: logsData, error: logsError } = await supabase
        .from("restore_report_logs")
        .select("status")
        .order("executed_at", { ascending: false })
        .limit(100);

      if (logsError) {
        console.error("Error fetching logs:", logsError);
      } else if (logsData) {
        // Count status occurrences
        const statusCounts: { [key: string]: number } = {};
        logsData.forEach((log) => {
          const status = log.status || "info";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Convert to chart data
        const chartData = Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }));

        setStatusData(chartData);
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && restoresByDay.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error && restoresByDay.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500">Erro ao carregar dados: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📺 Restore Logs - Real Time</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>
            Última atualização:{" "}
            {format(lastUpdate, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
          </span>
          <span className="text-green-500">● Atualização automática a cada 60s</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Total de Restaurações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-blue-500">{summary.total_restores}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Documentos Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-green-500">{summary.unique_documents}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Média por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-purple-500">
              {summary.avg_per_day.toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart - Restores by Day */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Restaurações por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {restoresByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={restoresByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="restore_date"
                    stroke="#9ca3af"
                    tickFormatter={(value) =>
                      format(new Date(value), "dd MMM", { locale: ptBR })
                    }
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      color: "#ffffff",
                    }}
                    labelFormatter={(value) =>
                      format(new Date(value as string), "dd 'de' MMMM", { locale: ptBR })
                    }
                  />
                  <Legend />
                  <Bar dataKey="restore_count" fill="#3b82f6" name="Restaurações" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Status dos Relatórios</CardTitle>
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
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[entry.name.toLowerCase() as keyof typeof COLORS] ||
                          COLORS.info
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      color: "#ffffff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Travel HR Buddy - TV Wall Dashboard</p>
      </div>
    </div>
  );
}
