"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RestoreCountData {
  restore_date: string;
  restore_count: number;
}

interface SummaryData {
  total_restores: number;
  unique_documents: number;
  average_per_day: number;
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

export default function TVWallLogsPage() {
  const [restoreCountData, setRestoreCountData] = useState<RestoreCountData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    total_restores: 0,
    unique_documents: 0,
    average_per_day: 0,
  });
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch restore count by day
      const { data: restoreData, error: restoreError } = await supabase
        .rpc("get_restore_count_by_day_with_email");

      if (restoreError) {
        console.error("Error fetching restore count:", restoreError);
      } else {
        // Get last 15 days
        const last15Days = (restoreData || []).slice(-15);
        setRestoreCountData(last15Days);
      }

      // Fetch summary statistics
      const { data: summary, error: summaryError } = await supabase
        .rpc("get_restore_summary");

      if (summaryError) {
        console.error("Error fetching summary:", summaryError);
      } else if (summary && summary.length > 0) {
        setSummaryData(summary[0]);
      }

      // Fetch status distribution from last 100 logs
      const { data: logs, error: logsError } = await supabase
        .from("restore_report_logs")
        .select("status")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logsError) {
        console.error("Error fetching logs:", logsError);
      } else if (logs) {
        // Count status occurrences
        const statusCounts: Record<string, number> = {};
        logs.forEach((log) => {
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
      setError("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string): string => {
    const normalizedStatus = status.toLowerCase();
    return COLORS[normalizedStatus as keyof typeof COLORS] || COLORS.info;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📺 Restore Logs - Real Time</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>Última atualização: {format(lastUpdate, "HH:mm:ss", { locale: ptBR })}</span>
          <span>•</span>
          <span>Atualização automática a cada 60 segundos</span>
        </div>
      </div>

      {/* Error message */}
      {error && !isLoading && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando dados...</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Total de Restaurações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-blue-400">{summaryData.total_restores}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Documentos Únicos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-green-400">{summaryData.unique_documents}</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Média por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-purple-400">
                  {summaryData.average_per_day.toFixed(1)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart - Restore Count by Day */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Restaurações por Dia (Últimos 15 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                {restoreCountData.length === 0 ? (
                  <div className="h-[400px] flex items-center justify-center text-gray-400">
                    Nenhum dado disponível
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={restoreCountData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="restore_date" 
                        stroke="#9ca3af"
                        tickFormatter={(value) => {
                          try {
                            return format(new Date(value), "MMM dd", { locale: ptBR });
                          } catch {
                            return value;
                          }
                        }}
                      />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1f2937", 
                          border: "1px solid #374151",
                          color: "#fff"
                        }}
                        labelFormatter={(value) => {
                          try {
                            return format(new Date(value), "dd 'de' MMMM", { locale: ptBR });
                          } catch {
                            return value;
                          }
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#fff" }} />
                      <Bar 
                        dataKey="restore_count" 
                        fill="#3b82f6" 
                        name="Restaurações"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pie Chart - Status Distribution */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Status dos Relatórios (Últimos 100)</CardTitle>
              </CardHeader>
              <CardContent>
                {statusData.length === 0 ? (
                  <div className="h-[400px] flex items-center justify-center text-gray-400">
                    Nenhum dado disponível
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getStatusColor(entry.name)}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#1f2937", 
                          border: "1px solid #374151",
                          color: "#fff"
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>© {new Date().getFullYear()} Nautilus One - TV Wall Dashboard</p>
          </div>
        </>
      )}
    </div>
  );
}
