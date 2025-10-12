"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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

const PIE_COLORS = [COLORS.success, COLORS.error, COLORS.warning, COLORS.info];

export default function TVWallLogs() {
  const [byDay, setByDay] = useState<RestoreCountByDay[]>([]);
  const [byStatus, setByStatus] = useState<StatusData[]>([]);
  const [summary, setSummary] = useState<RestoreSummary>({
    total: 0,
    unique_docs: 0,
    avg_per_day: 0,
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      // Fetch restore count by day
      const { data: countData } = await supabase.rpc(
        "get_restore_count_by_day_with_email",
        { email_input: "" }
      );

      if (countData) {
        // Format data for chart
        const formattedData = countData.map((item: RestoreCountByDay) => ({
          day: new Date(item.day).toLocaleDateString("pt-BR", {
            month: "short",
            day: "numeric",
          }),
          count: item.count,
        }));
        setByDay(formattedData.reverse()); // Show oldest to newest
      }

      // Fetch summary statistics
      const { data: summaryData } = await supabase.rpc("get_restore_summary", {
        email_input: "",
      });

      if (summaryData && summaryData.length > 0) {
        setSummary(summaryData[0]);
      }

      // Fetch restore report logs for status distribution
      const { data: reportLogs } = await supabase
        .from("restore_report_logs")
        .select("status")
        .order("executed_at", { ascending: false })
        .limit(100);

      if (reportLogs) {
        // Count by status
        const statusCounts: Record<string, number> = {};
        reportLogs.forEach((log) => {
          statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;
        });

        const statusData = Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }));
        setByStatus(statusData);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">📺 Restore Logs - Real Time</h1>
        <div className="text-right">
          <p className="text-sm text-gray-400">
            Última atualização:{" "}
            {lastUpdate.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          <p className="text-xs text-gray-500">Atualização automática a cada 60s</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Total de Restaurações</p>
              <p className="text-5xl font-bold text-blue-400">{summary.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Documentos Únicos</p>
              <p className="text-5xl font-bold text-green-400">{summary.unique_docs}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Média por Dia</p>
              <p className="text-5xl font-bold text-purple-400">
                {summary.avg_per_day.toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">
              📊 Restaurações por Dia
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="day"
                  stroke="#9ca3af"
                  style={{ fontSize: "14px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "14px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Legend wrapperStyle={{ color: "#f3f4f6" }} />
                <Bar dataKey="count" fill="#3b82f6" name="Restaurações" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">
              📈 Status dos Relatórios
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={byStatus}
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
                  {byStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm pt-8">
        <p>Nautilus One - Travel HR Buddy © {new Date().getFullYear()}</p>
        <p className="mt-2">Dashboard de Monitoramento em Tempo Real</p>
      </div>
    </div>
  );
}
