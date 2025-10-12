"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface SummaryData {
  total: number;
  unique_docs: number;
  avg_per_day: string;
  last_execution: string;
}

interface ChartDataPoint {
  day: string;
  count: number;
}

interface PieDataPoint {
  name: string;
  value: number;
}

interface RestoreLog {
  id: string;
  document_id: string;
  restored_at: string;
}

interface RestoreReportLog {
  id: string;
  executed_at: string;
  status: string;
  message: string | null;
}

export default function RestoreChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [pieData, setPieData] = useState<PieDataPoint[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const allowed = token === import.meta.env.VITE_EMBED_ACCESS_TOKEN;
    if (!allowed) {
      navigate("/unauthorized");
    }
  }, [token, navigate]);

  useEffect(() => {
    async function fetchSummaryData() {
      try {
        setLoading(true);

        // Fetch document restore logs
        const { data: restoreLogs, error: restoreError } = await supabase
          .from("document_restore_logs")
          .select("id, document_id, restored_at")
          .order("restored_at", { ascending: false });

        if (restoreError) {
          console.error("Error fetching restore logs:", restoreError);
          return;
        }

        // Fetch restore report logs (for status tracking)
        const { data: reportLogs, error: reportError } = await supabase
          .from("restore_report_logs")
          .select("id, executed_at, status, message")
          .order("executed_at", { ascending: false });

        if (reportError) {
          console.error("Error fetching report logs:", reportError);
        }

        // Process data
        const logs = restoreLogs || [];
        const reports = reportLogs || [];

        // Calculate summary statistics
        const total = logs.length;
        const uniqueDocs = new Set(logs.map((log) => log.document_id)).size;

        // Group by day for chart
        const byDayMap = new Map<string, number>();
        logs.forEach((log) => {
          const day = format(parseISO(log.restored_at), "dd/MM");
          byDayMap.set(day, (byDayMap.get(day) || 0) + 1);
        });

        const chartDataArray: ChartDataPoint[] = Array.from(byDayMap.entries())
          .map(([day, count]) => ({ day, count }))
          .slice(0, 7)
          .reverse();

        // Calculate average per day
        const daysWithData = byDayMap.size || 1;
        const avgPerDay = (total / daysWithData).toFixed(1);

        // Get last execution time
        const lastExecution =
          reports.length > 0
            ? format(parseISO(reports[0].executed_at), "dd/MM/yyyy HH:mm")
            : "N/A";

        // Group by status for pie chart
        const byStatusMap = new Map<string, number>();
        reports.forEach((report) => {
          const status = report.status.toLowerCase();
          byStatusMap.set(status, (byStatusMap.get(status) || 0) + 1);
        });

        const pieDataArray: PieDataPoint[] = Array.from(byStatusMap.entries()).map(
          ([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
          })
        );

        // Update state
        setChartData(chartDataArray);
        setPieData(pieDataArray);
        setSummary({
          total,
          unique_docs: uniqueDocs,
          avg_per_day: avgPerDay,
          last_execution: lastExecution,
        });
      } catch (error) {
        console.error("Error fetching summary data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummaryData();
  }, []);

  return (
    <div className="bg-white text-black h-screen w-screen p-6 space-y-6">
      <h1 className="text-3xl font-bold">📈 Restore Report Summary</h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              📦 <strong>Total:</strong> {summary?.total || 0}
            </div>
            <div>
              📁 <strong>Documentos únicos:</strong> {summary?.unique_docs || 0}
            </div>
            <div>
              📊 <strong>Média/dia:</strong> {summary?.avg_per_day || "0"}
            </div>
            <div>
              🕒 <strong>Última execução:</strong>{" "}
              {summary?.last_execution || "N/A"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">📆 Logs por Dia</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">📊 Por Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
