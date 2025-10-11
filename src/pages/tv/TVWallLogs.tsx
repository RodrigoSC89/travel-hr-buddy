// ✅ TV Wall Page — Real-Time Restore Logs with Chart Updates

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#4ade80", "#facc15", "#f87171"];

interface ChartDataPoint {
  day: string;
  count: number;
}

interface PieDataPoint {
  name: string;
  value: number;
}

interface SummaryData {
  byDay: ChartDataPoint[];
  byStatus: PieDataPoint[];
  total: number;
  lastUpdated: string;
}

export default function TVWallLogs() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [pieData, setPieData] = useState<PieDataPoint[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 1 min refresh
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      setError("");
      
      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("VITE_SUPABASE_URL not configured");
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/restore-logs-summary`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const data: SummaryData = result.data;
        setChartData(data.byDay || []);
        setPieData(data.byStatus || []);
        setTotal(data.total || 0);
        setLastUpdated(data.lastUpdated || "");
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      // Set default empty data on error
      setChartData([]);
      setPieData([]);
    }
  }

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-black text-white h-screen p-8 space-y-8 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">📺 Restore Logs - Real Time</h1>
        <div className="text-right">
          <div className="text-xl font-semibold">Total: {total}</div>
          {lastUpdated && (
            <div className="text-sm text-gray-400">
              Atualizado: {formatTime(lastUpdated)}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-md">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl mb-4 font-semibold">📆 Restaurações por Dia (Últimos 15 Dias)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="count" fill="#22d3ee" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Nenhum dado disponível
            </div>
          )}
        </div>

        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl mb-4 font-semibold">📊 Por Status</h2>
          {pieData.length > 0 && pieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelStyle={{ fill: "#fff", fontSize: "14px" }}
                >
                  {pieData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Nenhum dado disponível
            </div>
          )}
          
          {/* Legend */}
          {pieData.length > 0 && (
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        ⏱️ Atualização automática a cada 60 segundos
      </div>
    </div>
  );
}
